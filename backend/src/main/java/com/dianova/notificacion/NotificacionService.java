package com.dianova.notificacion;

import com.dianova.config.DianovaProperties;
import com.dianova.domain.Enums.CanalNotificacion;
import com.dianova.domain.Evento;
import com.dianova.domain.PreferenciaNotificacion;
import com.dianova.domain.Recordatorio;
import com.dianova.domain.Tarea;
import com.dianova.domain.Usuario;
import com.dianova.repository.PreferenciaRepository;
import com.dianova.repository.RecordatorioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Decide qué mensajes se envían y por qué canal, siempre según el consentimiento de cada usuario.
 * Los avisos de tareas y eventos se guardan como filas de "recordatorios" (historial con estado)
 * y los envía el DespachadorRecordatorios.
 */
@Service
public class NotificacionService {

    private static final Logger log = LoggerFactory.getLogger(NotificacionService.class);
    public static final DateTimeFormatter FECHA = DateTimeFormatter.ofPattern("EEE d 'de' MMM, HH:mm", Locale.of("es", "MX"));

    private final CorreoService correo;
    private final TwilioService twilio;
    private final PreferenciaRepository preferencias;
    private final RecordatorioRepository recordatorios;
    private final DianovaProperties props;

    public NotificacionService(CorreoService correo, TwilioService twilio, PreferenciaRepository preferencias,
                               RecordatorioRepository recordatorios, DianovaProperties props) {
        this.correo = correo;
        this.twilio = twilio;
        this.preferencias = preferencias;
        this.recordatorios = recordatorios;
        this.props = props;
    }

    // ------------------------------------------------------------------ correos de cuenta (no ligados a tarea/evento)

    @Async
    public void bienvenida(String para, String nombre) {
        enviarCorreoSeguro(para, PlantillasCorreo.bienvenida(nombre, props.frontendUrl()));
    }

    /**
     * Código para confirmar el correo al registrarse. Es síncrono: si no se entrega, el registro
     * responde 503 en lugar de dejar al estudiante esperando un correo que nunca llega.
     */
    public void codigoRegistro(String para, String codigo, long minutos) {
        PlantillasCorreo.Correo c = PlantillasCorreo.codigoRegistro(codigo, minutos);
        try {
            correo.enviar(para, c.asunto(), c.html(), c.texto());
        } catch (EnvioException e) {
            if (!codigoEnLog(para, codigo, e)) throw e;
        }
    }

    /** Código de recuperación por correo o SMS. Asíncrono para no revelar, por el tiempo de respuesta, si la cuenta existe. */
    @Async
    public void codigoRecuperacion(CanalNotificacion canal, String destino, String nombre, String codigo, long minutos) {
        try {
            if (canal == CanalNotificacion.SMS) {
                twilio.enviarSms(destino, "Dianova: tu código para restablecer tu contraseña es " + codigo
                        + ". Vence en " + minutos + " min. No lo compartas con nadie.");
            } else {
                PlantillasCorreo.Correo c = PlantillasCorreo.codigoRecuperacion(nombre, codigo, minutos);
                correo.enviar(destino, c.asunto(), c.html(), c.texto());
            }
        } catch (EnvioException e) {
            if (!codigoEnLog(destino, codigo, e)) {
                log.warn("No se envió el código de recuperación por {} a {}: {}", canal, destino, e.getMessage());
            }
        }
    }

    /**
     * Solo en desarrollo (dianova.notificaciones.codigos-en-log=true): sin correo ni Twilio configurados,
     * el código se escribe en el log para poder probar el flujo. En producción debe quedar en false.
     */
    private boolean codigoEnLog(String destino, String codigo, EnvioException e) {
        if (!props.notificaciones().codigosEnLog()) return false;
        log.warn("[SOLO DESARROLLO] No se envió el código a {} ({}). Código: {}", destino, e.getMessage(), codigo);
        return true;
    }

    @Async
    public void contrasenaCambiada(String para, String nombre) {
        enviarCorreoSeguro(para, PlantillasCorreo.contrasenaCambiada(nombre, props.frontendUrl()));
    }

    private void enviarCorreoSeguro(String para, PlantillasCorreo.Correo c) {
        try {
            correo.enviar(para, c.asunto(), c.html(), c.texto());
        } catch (EnvioException e) {
            log.warn("No se envió '{}' a {}: {}", c.asunto(), para, e.getMessage());
        }
    }

    // ------------------------------------------------------------------ avisos que disparan acciones reales del sistema

    /** Un docente publicó una tarea: aviso inmediato por cada canal autorizado + recordatorio por correo antes de la entrega. */
    public int programarAvisosTareaPublicada(Tarea tarea, Collection<Usuario> estudiantes) {
        String materia = tarea.getMateria() != null ? tarea.getMateria().getNombre() : "tu materia";
        String texto = "Dianova: nueva tarea en " + materia + ": \"" + tarea.getTitulo() + "\". Entrega: "
                + FECHA.format(tarea.getFechaEntrega()) + ".";
        LocalDateTime ahora = LocalDateTime.now();
        List<Recordatorio> nuevos = new ArrayList<>();
        Map<Long, PreferenciaNotificacion> prefs = preferenciasDe(estudiantes);
        for (Usuario e : estudiantes) {
            PreferenciaNotificacion p = prefs.get(e.getId());
            for (CanalNotificacion canal : canalesAutorizados(e, p)) {
                nuevos.add(nuevo(e, tarea, null, canal, ahora, texto));
            }
            if (p != null && p.isEmailHabilitado()) {
                LocalDateTime antes = tarea.getFechaEntrega().minusMinutes(p.getMinutosAnticipacion());
                if (antes.isAfter(ahora.plusMinutes(5))) {
                    nuevos.add(nuevo(e, tarea, null, CanalNotificacion.EMAIL, antes, null));
                }
            }
        }
        recordatorios.saveAll(nuevos);
        return nuevos.size();
    }

    /** Un docente programó un evento de su materia: aviso inmediato a los inscritos por sus canales autorizados. */
    public int programarAvisosEvento(Evento evento, Collection<Usuario> invitados) {
        String texto = "Dianova: nuevo evento \"" + evento.getTitulo() + "\" el " + FECHA.format(evento.getInicio())
                + (evento.getUbicacion() != null ? " en " + evento.getUbicacion() : "") + ".";
        LocalDateTime ahora = LocalDateTime.now();
        Map<Long, PreferenciaNotificacion> prefs = preferenciasDe(invitados);
        List<Recordatorio> nuevos = new ArrayList<>();
        for (Usuario u : invitados) {
            for (CanalNotificacion canal : canalesAutorizados(u, prefs.get(u.getId()))) {
                nuevos.add(nuevo(u, null, evento, canal, ahora, texto));
            }
        }
        recordatorios.saveAll(nuevos);
        return nuevos.size();
    }

    /** Canales que el usuario aceptó y que puede recibir (SMS y WhatsApp requieren teléfono). */
    public List<CanalNotificacion> canalesAutorizados(Usuario u, PreferenciaNotificacion p) {
        if (p == null) return List.of();
        List<CanalNotificacion> canales = new ArrayList<>();
        if (p.isEmailHabilitado()) canales.add(CanalNotificacion.EMAIL);
        boolean tieneTelefono = u.getTelefono() != null && !u.getTelefono().isBlank();
        if (p.isSmsHabilitado() && tieneTelefono) canales.add(CanalNotificacion.SMS);
        if (p.isWhatsappHabilitado() && tieneTelefono) canales.add(CanalNotificacion.WHATSAPP);
        return canales;
    }

    public boolean canalAutorizado(Usuario u, PreferenciaNotificacion p, CanalNotificacion canal) {
        return canalesAutorizados(u, p).contains(canal);
    }

    private Map<Long, PreferenciaNotificacion> preferenciasDe(Collection<Usuario> usuarios) {
        Set<Long> ids = usuarios.stream().map(Usuario::getId).collect(Collectors.toSet());
        return preferencias.findAllById(ids).stream()
                .collect(Collectors.toMap(PreferenciaNotificacion::getId, Function.identity()));
    }

    private Recordatorio nuevo(Usuario u, Tarea t, Evento e, CanalNotificacion canal, LocalDateTime cuando, String texto) {
        Recordatorio r = new Recordatorio();
        r.setUsuario(u);
        r.setTarea(t);
        r.setEvento(e);
        r.setCanal(canal);
        r.setProgramadoPara(cuando);
        r.setMensaje(texto);
        return r;
    }
}
