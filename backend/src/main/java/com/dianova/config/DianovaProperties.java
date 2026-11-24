package com.dianova.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * Configuración propia de Dianova (prefijo "dianova" en application.properties).
 * Los valores sensibles viven solo en application.properties, que no se sube al repositorio.
 */
@ConfigurationProperties(prefix = "dianova")
public record DianovaProperties(
        String zonaHoraria,
        String frontendUrl,
        List<String> corsOrigenes,
        Jwt jwt,
        Notificaciones notificaciones) {

    public record Jwt(
            /* Clave HMAC de al menos 32 bytes, en Base64 */
            String secreto,
            long minutosExpiracion,
            String emisor) {
    }

    public record Notificaciones(
            long intervaloMs,
            int maxIntentos,
            int minutosReintento,
            /* Correos de estos dominios no se envían (datos de demostración) */
            List<String> dominiosDemo,
            Correo correo,
            Twilio twilio) {
    }

    public record Correo(boolean habilitado, String remitente, String nombreRemitente) {
    }

    public record Twilio(
            boolean habilitado,
            String accountSid,
            String authToken,
            /* Número Twilio para SMS, formato E.164: +1XXXXXXXXXX */
            String numeroSms,
            /* Remitente de WhatsApp, por ejemplo whatsapp:+14155238886 (sandbox) */
            String numeroWhatsapp,
            String urlApi) {
    }
}
