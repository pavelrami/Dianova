package com.dianova.notificacion;

import com.dianova.config.DianovaProperties;
import com.dianova.domain.Enums.EstadoRecordatorio;
import com.dianova.domain.PreferenciaNotificacion;
import com.dianova.domain.Recordatorio;
import com.dianova.domain.Usuario;
import com.dianova.repository.PreferenciaRepository;
import com.dianova.repository.RecordatorioRepository;
import com.dianova.repository.SesionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Cada N segundos toma los recordatorios PENDIENTES cuya hora ya llegó y los envía por su canal.
 * Lectura y actualización van en transacciones cortas; el envío de red ocurre fuera de ellas.
 */
@Component
public class DespachadorRecordatorios {

    private static final Logger log = LoggerFactory.getLogger(DespachadorRecordatorios.class);

    private final RecordatorioRepository recordatorios;
    private final PreferenciaRepository preferencias;
    private final SesionRepository sesiones;
    private final CorreoService correo;
    private final TwilioService twilio;
    private final NotificacionService notificaciones;
    private final TransactionTemplate tx;
    private final DianovaProperties props;

    public DespachadorRecordatorios(RecordatorioRepository recordatorios, PreferenciaRepository preferencias,
                                    SesionRepository sesiones, CorreoService correo, TwilioService twilio,
                                    NotificacionService notificaciones, TransactionTemplate tx, DianovaProperties props) {
        this.recordatorios = recordatorios;
        this.preferencias = preferencias;
        this.sesiones = sesiones;
        this.correo = correo;
        this.twilio = twilio;
        this.notificaciones = notificaciones;
        this.tx = tx;
        this.props = props;
    }

    @Scheduled(fixedDelayString = "${dianova.notificaciones.intervalo-ms:30000}", initialDelay = 20000)
    public void procesarPendientes() {
        List<Long> ids = tx.execute(s -> recordatorios
                .vencidos(EstadoRecordatorio.PENDIENTE, LocalDateTime.now(), PageRequest.of(0, 50))
                .stream().map(Recordatorio::getId).toList());
        if (ids == null || ids.isEmpty()) return;
        log.info("Procesando {} recordatorio(s) pendiente(s)", ids.size());
        ids.forEach(this::procesar);
    }

    /** Limpieza diaria de sesiones JWT vencidas hace más de 7 días. */
    @Scheduled(cron = "0 30 3 * * *")
    public void limpiarSesiones() {
        Integer n = tx.execute(s -> sesiones.borrarExpiradas(LocalDateTime.now().minusDays(7)));
        log.info("Sesiones expiradas eliminadas: {}", n);
    }

    /**
     * Envía un recordatorio concreto. synchronized evita que el envío manual ("Enviar ahora")
     * y el programado manden el mismo mensaje dos veces.
     */
    public synchronized void procesar(Long id) {
        Preparado p = tx.execute(s -> preparar(id));
        if (p == null) return;
        String error = null;
        boolean reintentable = false;
        try {
            enviar(p);
        } catch (EnvioException e) {
            error = e.getMessage();
            reintentable = e.isReintentable();
        } catch (RuntimeException e) {
            log.error("Error inesperado enviando recordatorio {}", id, e);
            error = "Error inesperado: " + e.getMessage();
            reintentable = true;
        }
        final String err = error;
        final boolean reintentar = reintentable;
        tx.executeWithoutResult(s -> recordatorios.findById(id).ifPresent(r -> {
            if (err == null) {
                r.marcarEnviado();
            } else {
                int max = reintentar ? props.notificaciones().maxIntentos() : 0;
                r.registrarFallo(err, max, props.notificaciones().minutosReintento());
                log.warn("Recordatorio {} ({}) falló: {}", id, r.getCanal(), err);
            }
        }));
    }

    /** Toma una "foto" de lo necesario para enviar; null si ya no está pendiente. */
    private Preparado preparar(Long id) {
        Recordatorio r = recordatorios.buscarDetalle(id).orElse(null);
        if (r == null || r.getEstado() != EstadoRecordatorio.PENDIENTE) return null;
        Usuario u = r.getUsuario();
        PreferenciaNotificacion pref = preferencias.findById(u.getId()).orElse(null);
        if (!u.isActivo()) {
            r.setEstado(EstadoRecordatorio.CANCELADO);
            r.setDetalleError("La cuenta del usuario está desactivada");
            return null;
        }
        if (!notificaciones.canalAutorizado(u, pref, r.getCanal())) {
            r.setEstado(EstadoRecordatorio.CANCELADO);
            r.setDetalleError("El usuario no autoriza el canal " + r.getCanal() + " o no tiene teléfono");
            return null;
        }
        String titulo;
        String texto = r.getMensaje();
        if (r.getTarea() != null) {
            titulo = "Recordatorio: " + r.getTarea().getTitulo();
            if (texto == null || texto.isBlank()) {
                texto = "Dianova: tu tarea \"" + r.getTarea().getTitulo() + "\" vence el "
                        + NotificacionService.FECHA.format(r.getTarea().getFechaEntrega()) + ".";
            }
        } else {
            titulo = "Recordatorio: " + r.getEvento().getTitulo();
            if (texto == null || texto.isBlank()) {
                texto = "Dianova: \"" + r.getEvento().getTitulo() + "\" empieza el "
                        + NotificacionService.FECHA.format(r.getEvento().getInicio())
                        + (r.getEvento().getUbicacion() != null ? " en " + r.getEvento().getUbicacion() : "") + ".";
            }
        }
        return new Preparado(r.getCanal().name(), u.getCorreo(), u.getTelefono(), u.getNombre(), titulo, texto);
    }

    private void enviar(Preparado p) {
        switch (p.canal()) {
            case "EMAIL" -> {
                PlantillasCorreo.Correo c = PlantillasCorreo.recordatorio(p.nombre(), p.titulo(), p.texto(), props.frontendUrl());
                correo.enviar(p.correo(), c.asunto(), c.html(), c.texto());
            }
            case "SMS" -> twilio.enviarSms(p.telefono(), p.texto());
            case "WHATSAPP" -> twilio.enviarWhatsapp(p.telefono(), p.texto());
            default -> throw EnvioException.definitivo("Canal desconocido " + p.canal());
        }
    }

    private record Preparado(String canal, String correo, String telefono, String nombre, String titulo, String texto) {
    }
}
