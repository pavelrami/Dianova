package com.dianova.notificacion;

import org.springframework.web.util.HtmlUtils;

import java.util.List;

/** Correos HTML sencillos con los colores de Dianova (espresso, crema, mantequilla y vino). */
public final class PlantillasCorreo {

    private PlantillasCorreo() {
    }

    public record Correo(String asunto, String html, String texto) {
    }

    public static Correo bienvenida(String nombre, String urlApp) {
        return armar("Bienvenido a Dianova", "Hola, " + nombre,
                List.of("Tu cuenta de Dianova está lista. Desde ahora puedes organizar tus clases, tareas, eventos y recordatorios en un solo lugar.",
                        "En Perfil > Notificaciones eliges si quieres avisos por correo, SMS o WhatsApp."),
                "Entrar a Dianova", urlApp);
    }

    public static Correo recuperacion(String nombre, String enlace, long minutos) {
        return armar("Restablece tu contraseña de Dianova", "Hola, " + nombre,
                List.of("Recibimos una solicitud para restablecer tu contraseña.",
                        "El enlace funciona una sola vez y vence en " + minutos + " minutos. Si no fuiste tú, ignora este mensaje: tu contraseña no cambia."),
                "Crear nueva contraseña", enlace);
    }

    public static Correo contrasenaCambiada(String nombre, String urlApp) {
        return armar("Tu contraseña de Dianova cambió", "Hola, " + nombre,
                List.of("Te avisamos que la contraseña de tu cuenta se cambió y cerramos tus otras sesiones.",
                        "Si no fuiste tú, restablécela de inmediato desde la pantalla de inicio de sesión."),
                "Ir a Dianova", urlApp);
    }

    public static Correo recordatorio(String nombre, String titulo, String texto, String urlApp) {
        return armar(titulo, "Hola, " + nombre, List.of(texto), "Abrir Dianova", urlApp);
    }

    private static Correo armar(String asunto, String saludo, List<String> parrafos, String boton, String url) {
        StringBuilder p = new StringBuilder();
        for (String s : parrafos) {
            p.append("<p style=\"margin:0 0 14px;font-size:15px;line-height:1.6;color:#4A3A30\">")
                    .append(HtmlUtils.htmlEscape(s)).append("</p>");
        }
        String html = """
                <!doctype html><html lang="es"><body style="margin:0;background:#FBF4E8;font-family:Arial,Helvetica,sans-serif">
                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#FBF4E8;padding:32px 12px">
                <tr><td align="center">
                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFDF8;border:1px solid #EADBC4;border-radius:18px;overflow:hidden">
                <tr><td style="background:#3B2418;padding:22px 28px;color:#FFE3A1;font-size:20px;font-weight:bold;letter-spacing:.3px">&#10022; Dianova</td></tr>
                <tr><td style="padding:28px">
                <h1 style="margin:0 0 16px;font-size:20px;color:#3B2418">%s</h1>
                %s
                <p style="margin:24px 0 8px"><a href="%s" style="display:inline-block;background:#7A1F1F;color:#FFFFFF;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px">%s</a></p>
                <p style="margin:18px 0 0;font-size:12px;color:#8A7766">Si el botón no funciona, copia este enlace: %s</p>
                </td></tr></table>
                <p style="font-size:12px;color:#8A7766;margin:16px 0 0">Dianova · Planificación académica</p>
                </td></tr></table></body></html>
                """.formatted(HtmlUtils.htmlEscape(saludo), p, HtmlUtils.htmlEscape(url), HtmlUtils.htmlEscape(boton),
                HtmlUtils.htmlEscape(url));
        String texto = saludo + "\n\n" + String.join("\n\n", parrafos) + "\n\n" + boton + ": " + url + "\n\nDianova";
        return new Correo(asunto, html, texto);
    }
}
