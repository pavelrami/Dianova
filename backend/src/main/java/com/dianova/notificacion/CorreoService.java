package com.dianova.notificacion;

import com.dianova.config.DianovaProperties;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.util.Locale;

/**
 * Envío de correo real a través del Postfix instalado en el VPS (spring.mail.host=localhost, puerto 25).
 * Postfix firma con DKIM (OpenDKIM) y el dominio publica SPF/DKIM/DMARC para no caer en spam.
 */
@Service
public class CorreoService {

    private static final Logger log = LoggerFactory.getLogger(CorreoService.class);

    private final ObjectProvider<JavaMailSender> mailSender;
    private final DianovaProperties props;

    public CorreoService(ObjectProvider<JavaMailSender> mailSender, DianovaProperties props) {
        this.mailSender = mailSender;
        this.props = props;
    }

    public void enviar(String para, String asunto, String html, String textoPlano) {
        DianovaProperties.Correo cfg = props.notificaciones().correo();
        if (!cfg.habilitado()) {
            throw EnvioException.definitivo("El envío de correo está deshabilitado (dianova.notificaciones.correo.habilitado=false)");
        }
        if (esDominioDemo(para)) {
            throw EnvioException.definitivo("Destinatario de demostración (" + para + "): no se envía");
        }
        JavaMailSender sender = mailSender.getIfAvailable();
        if (sender == null) {
            throw EnvioException.definitivo("No hay servidor de correo configurado (spring.mail.host)");
        }
        try {
            MimeMessage msg = sender.createMimeMessage();
            MimeMessageHelper h = new MimeMessageHelper(msg, true, "UTF-8");
            h.setFrom(new InternetAddress(cfg.remitente(), cfg.nombreRemitente(), "UTF-8"));
            h.setTo(para);
            h.setSubject(asunto);
            h.setText(textoPlano, html);
            sender.send(msg);
            log.info("Correo enviado a {} ({})", para, asunto);
        } catch (MailAuthenticationException e) {
            throw new EnvioException("El servidor de correo rechazó la autenticación", false, e);
        } catch (MailException e) {
            throw new EnvioException("No se pudo entregar el correo: " + e.getMostSpecificCause().getMessage(), true, e);
        } catch (MessagingException | UnsupportedEncodingException e) {
            throw new EnvioException("Correo mal formado: " + e.getMessage(), false, e);
        }
    }

    public boolean esDominioDemo(String correo) {
        if (correo == null || props.notificaciones().dominiosDemo() == null) return false;
        String c = correo.toLowerCase(Locale.ROOT);
        return props.notificaciones().dominiosDemo().stream().anyMatch(d -> c.endsWith("@" + d.toLowerCase(Locale.ROOT)));
    }
}
