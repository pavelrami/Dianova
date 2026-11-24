package com.dianova.notificacion;

import com.dianova.config.DianovaProperties;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.time.Duration;

/**
 * SMS y WhatsApp mediante la API REST de Twilio (POST /2010-04-01/Accounts/{sid}/Messages.json).
 * Se usa RestClient de Spring en lugar del SDK para no añadir dependencias.
 */
@Service
public class TwilioService {

    private static final Logger log = LoggerFactory.getLogger(TwilioService.class);

    private final DianovaProperties.Twilio cfg;
    private final RestClient http;

    public TwilioService(DianovaProperties props, RestClient.Builder builder) {
        this.cfg = props.notificaciones().twilio();
        SimpleClientHttpRequestFactory rf = new SimpleClientHttpRequestFactory();
        rf.setConnectTimeout(Duration.ofSeconds(10));
        rf.setReadTimeout(Duration.ofSeconds(20));
        String base = cfg.urlApi() == null || cfg.urlApi().isBlank() ? "https://api.twilio.com" : cfg.urlApi();
        this.http = builder.baseUrl(base).requestFactory(rf).build();
    }

    public String enviarSms(String telefono, String texto) {
        return enviar(telefono, cfg.numeroSms(), texto, "SMS");
    }

    public String enviarWhatsapp(String telefono, String texto) {
        String desde = cfg.numeroWhatsapp() == null ? null
                : (cfg.numeroWhatsapp().startsWith("whatsapp:") ? cfg.numeroWhatsapp() : "whatsapp:" + cfg.numeroWhatsapp());
        return enviar("whatsapp:" + telefono, desde, texto, "WhatsApp");
    }

    private String enviar(String para, String desde, String texto, String canal) {
        if (!cfg.habilitado()) {
            throw EnvioException.definitivo(canal + " deshabilitado (dianova.notificaciones.twilio.habilitado=false)");
        }
        if (vacio(cfg.accountSid()) || vacio(cfg.authToken()) || vacio(desde)) {
            throw EnvioException.definitivo("Faltan credenciales o número remitente de Twilio para " + canal);
        }
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("To", para);
        form.add("From", desde);
        form.add("Body", texto.length() > 1500 ? texto.substring(0, 1500) : texto);
        try {
            JsonNode res = http.post()
                    .uri("/2010-04-01/Accounts/{sid}/Messages.json", cfg.accountSid())
                    .headers(h -> h.setBasicAuth(cfg.accountSid(), cfg.authToken()))
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(JsonNode.class);
            String sid = res != null && res.hasNonNull("sid") ? res.get("sid").asText() : "?";
            log.info("{} enviado a {} (sid {})", canal, para, sid);
            return sid;
        } catch (RestClientResponseException e) {
            // 4xx: número inválido, destinatario no unido al sandbox, credenciales... no tiene caso reintentar
            String detalle = e.getResponseBodyAsString();
            boolean reintentable = e.getStatusCode().is5xxServerError() || e.getStatusCode().value() == 429;
            throw new EnvioException("Twilio respondió " + e.getStatusCode().value() + ": " + recortar(detalle), reintentable, e);
        } catch (ResourceAccessException e) {
            throw new EnvioException("No se pudo conectar con Twilio: " + e.getMessage(), true, e);
        }
    }

    private static boolean vacio(String s) {
        return s == null || s.isBlank();
    }

    private static String recortar(String s) {
        return s == null ? "" : s.substring(0, Math.min(s.length(), 300));
    }
}
