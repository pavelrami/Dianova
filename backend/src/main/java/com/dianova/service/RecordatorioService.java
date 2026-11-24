package com.dianova.service;

import com.dianova.domain.*;
import com.dianova.domain.Enums.CanalNotificacion;
import com.dianova.domain.Enums.EstadoRecordatorio;
import com.dianova.dto.comun.PaginaDto;
import com.dianova.dto.recordatorio.RecordatorioDto;
import com.dianova.dto.recordatorio.RecordatorioRequest;
import com.dianova.exception.AccesoDenegadoException;
import com.dianova.exception.RecursoNoEncontradoException;
import com.dianova.exception.ReglaNegocioException;
import com.dianova.notificacion.DespachadorRecordatorios;
import com.dianova.notificacion.NotificacionService;
import com.dianova.repository.*;
import com.dianova.security.UsuarioPrincipal;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.Map;

/** Recordatorios programados por correo, SMS o WhatsApp, con su historial de envío. */
@Service
public class RecordatorioService {

    private static final Map<String, String> ORDEN = Map.of("programado", "programadoPara", "creado", "creadoEn", "estado", "estado");

    private final RecordatorioRepository recordatorios;
    private final TareaRepository tareas;
    private final EventoRepository eventos;
    private final UsuarioRepository usuarios;
    private final PreferenciaRepository preferencias;
    private final NotificacionService notificaciones;
    private final DespachadorRecordatorios despachador;
    private final Permisos permisos;
    private final TransactionTemplate tx;

    public RecordatorioService(RecordatorioRepository recordatorios, TareaRepository tareas, EventoRepository eventos,
                               UsuarioRepository usuarios, PreferenciaRepository preferencias,
                               NotificacionService notificaciones, DespachadorRecordatorios despachador,
                               Permisos permisos, TransactionTemplate tx) {
        this.recordatorios = recordatorios;
        this.tareas = tareas;
        this.eventos = eventos;
        this.usuarios = usuarios;
        this.preferencias = preferencias;
        this.notificaciones = notificaciones;
        this.despachador = despachador;
        this.permisos = permisos;
        this.tx = tx;
    }

    /** Recordatorios propios. Con todos=true (solo admin) lista los de todo el sistema para supervisarlos. */
    @Transactional(readOnly = true)
    public PaginaDto<RecordatorioDto> listar(UsuarioPrincipal a, boolean todos, EstadoRecordatorio estado,
                                             CanalNotificacion canal, String q, int page, int size, String orden, String dir) {
        Long usuarioId = todos && a.esAdmin() ? null : a.getId();
        Sort sort = Sort.by(Consultas.direccion(dir), ORDEN.getOrDefault(orden, "programadoPara"));
        return PaginaDto.de(recordatorios.buscar(usuarioId, estado, canal, Consultas.like(q),
                Consultas.pagina(page, size, sort)), RecordatorioDto::de);
    }

    @Transactional
    public RecordatorioDto crear(UsuarioPrincipal a, RecordatorioRequest req) {
        Usuario u = usuarios.buscarConRol(a.getId()).orElseThrow();
        PreferenciaNotificacion pref = preferencias.findById(u.getId()).orElse(null);
        if (!notificaciones.canalAutorizado(u, pref, req.canal())) {
            throw ReglaNegocioException.campo("canal", switch (req.canal()) {
                case EMAIL -> "Activa los avisos por correo en tus preferencias";
                case SMS -> "Activa SMS en tus preferencias y registra tu teléfono";
                case WHATSAPP -> "Activa WhatsApp en tus preferencias y registra tu teléfono";
            });
        }
        Recordatorio r = new Recordatorio();
        r.setUsuario(u);
        if (req.tareaId() != null) {
            Tarea t = tareas.buscarDetalle(req.tareaId())
                    .orElseThrow(() -> ReglaNegocioException.campo("tareaId", "La tarea elegida no existe"));
            if (!permisos.puedeVerTarea(a, t)) throw new AccesoDenegadoException("No tienes acceso a esa tarea");
            r.setTarea(t);
        } else {
            Evento e = eventos.buscarDetalle(req.eventoId())
                    .orElseThrow(() -> ReglaNegocioException.campo("eventoId", "El evento elegido no existe"));
            if (!permisos.puedeVerEvento(a, e)) throw new AccesoDenegadoException("No tienes acceso a ese evento");
            r.setEvento(e);
        }
        r.setCanal(req.canal());
        r.setProgramadoPara(req.programadoPara());
        r.setMensaje(Consultas.limpiar(req.mensaje()));
        return RecordatorioDto.de(recordatorios.save(r));
    }

    @Transactional
    public RecordatorioDto cancelar(UsuarioPrincipal a, Long id) {
        Recordatorio r = propio(a, id);
        if (r.getEstado() != EstadoRecordatorio.PENDIENTE) {
            throw new ReglaNegocioException("Solo se pueden cancelar recordatorios pendientes");
        }
        r.setEstado(EstadoRecordatorio.CANCELADO);
        return RecordatorioDto.de(r);
    }

    @Transactional
    public void eliminar(UsuarioPrincipal a, Long id) {
        recordatorios.delete(propio(a, id));
    }

    /** Acción real que dispara el envío en el momento (correo, SMS o WhatsApp) y devuelve el resultado. */
    public RecordatorioDto enviarAhora(UsuarioPrincipal a, Long id) {
        tx.executeWithoutResult(s -> {
            Recordatorio r = propio(a, id);
            if (r.getEstado() == EstadoRecordatorio.ENVIADO || r.getEstado() == EstadoRecordatorio.CANCELADO) {
                throw new ReglaNegocioException("Este recordatorio ya fue " + r.getEstado().name().toLowerCase());
            }
            r.setEstado(EstadoRecordatorio.PENDIENTE);
            r.setIntentos(0);
            r.setDetalleError(null);
            r.setProgramadoPara(LocalDateTime.now());
        });
        despachador.procesar(id);
        return tx.execute(s -> RecordatorioDto.de(recordatorios.buscarDetalle(id).orElseThrow()));
    }

    private Recordatorio propio(UsuarioPrincipal a, Long id) {
        Recordatorio r = recordatorios.buscarDetalle(id).orElseThrow(() -> RecursoNoEncontradoException.de("Recordatorio", id));
        if (!a.esAdmin() && !r.getUsuario().getId().equals(a.getId())) {
            throw new AccesoDenegadoException("Este recordatorio no es tuyo");
        }
        return r;
    }
}
