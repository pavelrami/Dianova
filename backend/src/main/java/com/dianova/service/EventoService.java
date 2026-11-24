package com.dianova.service;

import com.dianova.domain.*;
import com.dianova.domain.Enums.*;
import com.dianova.dto.comun.PaginaDto;
import com.dianova.dto.evento.EventoDtos.*;
import com.dianova.exception.AccesoDenegadoException;
import com.dianova.exception.RecursoNoEncontradoException;
import com.dianova.exception.ReglaNegocioException;
import com.dianova.notificacion.NotificacionService;
import com.dianova.repository.*;
import com.dianova.security.UsuarioPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/** Eventos personales o de materia, con invitaciones (N:M usuario-evento), respuesta y asistencia. */
@Service
@Transactional
public class EventoService {

    private final EventoRepository eventos;
    private final ParticipacionRepository participaciones;
    private final MateriaRepository materias;
    private final UsuarioRepository usuarios;
    private final InscripcionRepository inscripciones;
    private final RecordatorioRepository recordatorios;
    private final NotificacionService notificaciones;
    private final Permisos permisos;

    public EventoService(EventoRepository eventos, ParticipacionRepository participaciones, MateriaRepository materias,
                         UsuarioRepository usuarios, InscripcionRepository inscripciones,
                         RecordatorioRepository recordatorios, NotificacionService notificaciones, Permisos permisos) {
        this.eventos = eventos;
        this.participaciones = participaciones;
        this.materias = materias;
        this.usuarios = usuarios;
        this.inscripciones = inscripciones;
        this.recordatorios = recordatorios;
        this.notificaciones = notificaciones;
        this.permisos = permisos;
    }

    public record Filtros(String q, TipoEvento tipo, Long materiaId, EstadoEvento estado, LocalDateTime desde,
                          LocalDateTime hasta, String dir) {
    }

    @Transactional(readOnly = true)
    public PaginaDto<EventoDto> listar(UsuarioPrincipal a, Filtros f, int page, int size) {
        Page<Evento> p = eventos.visibles(a.getId(), a.esAdmin(), EstadoInscripcion.ACTIVA, Consultas.like(f.q()), f.tipo(),
                f.materiaId(), f.estado(), f.desde(), f.hasta(),
                Consultas.pagina(page, size, Sort.by(Consultas.direccion(f.dir()), "inicio")));
        return PaginaDto.de(p, aDtos(a, p.getContent()));
    }

    /** Eventos visibles en un rango (calendario y agenda), sin paginar pero acotado por fechas. */
    @Transactional(readOnly = true)
    public List<EventoDto> enRango(UsuarioPrincipal a, LocalDateTime desde, LocalDateTime hasta, Long materiaId, TipoEvento tipo) {
        List<Evento> lista = eventos.visiblesEnRango(a.getId(), a.esAdmin(), EstadoInscripcion.ACTIVA, null, tipo, materiaId,
                null, desde, hasta);
        return aDtos(a, lista);
    }

    @Transactional(readOnly = true)
    public EventoDto obtener(UsuarioPrincipal a, Long id) {
        Evento e = cargar(id);
        if (!permisos.puedeVerEvento(a, e)) {
            throw new AccesoDenegadoException("No tienes acceso a este evento");
        }
        return aDtos(a, List.of(e)).getFirst();
    }

    public EventoDto crear(UsuarioPrincipal a, EventoRequest req) {
        Evento e = new Evento();
        e.setCreador(usuarios.buscarConRol(a.getId()).orElseThrow());
        aplicar(e, req);
        e.setMateria(materiaPermitida(a, req.materiaId()));
        e.setEstado(EstadoEvento.PROGRAMADO);
        eventos.save(e);
        if (e.getMateria() != null) {
            List<Usuario> invitados = inscripciones.estudiantesDe(e.getMateria().getId(), EstadoInscripcion.ACTIVA);
            participaciones.saveAll(invitados.stream().map(u -> new ParticipacionEvento(e, u)).toList());
            notificaciones.programarAvisosEvento(e, invitados);
        }
        return aDtos(a, List.of(e)).getFirst();
    }

    public EventoDto actualizar(UsuarioPrincipal a, Long id, EventoRequest req) {
        Evento e = cargar(id);
        if (!permisos.gestionaEvento(a, e)) {
            throw new AccesoDenegadoException("Solo quien creó el evento o un administrador pueden editarlo");
        }
        Long actual = e.getMateria() == null ? null : e.getMateria().getId();
        if (req.materiaId() != null && !req.materiaId().equals(actual) || req.materiaId() == null && actual != null) {
            throw ReglaNegocioException.campo("materiaId", "La materia de un evento no se puede cambiar; crea un evento nuevo");
        }
        aplicar(e, req);
        if (req.estado() != null) {
            e.setEstado(req.estado());
        }
        return aDtos(a, List.of(e)).getFirst();
    }

    public void eliminar(UsuarioPrincipal a, Long id) {
        Evento e = cargar(id);
        if (!permisos.gestionaEvento(a, e)) {
            throw new AccesoDenegadoException("No puedes eliminar este evento");
        }
        recordatorios.borrarDeEvento(id);
        eventos.delete(e);
    }

    /** El invitado confirma o rechaza su asistencia. */
    public EventoDto responder(UsuarioPrincipal a, Long eventoId, RespuestaParticipacion respuesta) {
        if (respuesta == RespuestaParticipacion.PENDIENTE) {
            throw ReglaNegocioException.campo("respuesta", "Responde CONFIRMADA o RECHAZADA");
        }
        ParticipacionEvento p = participaciones.findByEventoIdAndUsuarioId(eventoId, a.getId())
                .orElseThrow(() -> new AccesoDenegadoException("No estás invitado a este evento"));
        if (p.getEvento().getEstado() == EstadoEvento.CANCELADO) {
            throw new ReglaNegocioException("El evento fue cancelado");
        }
        p.setRespuesta(respuesta);
        p.setRespondidoEn(LocalDateTime.now());
        return obtener(a, eventoId);
    }

    @Transactional(readOnly = true)
    public PaginaDto<ParticipacionDto> participantes(UsuarioPrincipal a, Long eventoId, RespuestaParticipacion respuesta,
                                                     int page, int size) {
        Evento e = cargar(eventoId);
        if (!permisos.gestionaEvento(a, e)) {
            throw new AccesoDenegadoException("Solo quien organiza el evento puede ver la lista de invitados");
        }
        return PaginaDto.de(participaciones.deEvento(eventoId, respuesta,
                Consultas.pagina(page, size, Sort.by("usuario.apellidos"))), ParticipacionDto::de);
    }

    public ParticipacionDto marcarAsistencia(UsuarioPrincipal a, Long eventoId, Long participacionId, boolean asistio) {
        ParticipacionEvento p = participaciones.buscarDetalle(participacionId)
                .filter(x -> x.getEvento().getId().equals(eventoId))
                .orElseThrow(() -> RecursoNoEncontradoException.de("Participación", participacionId));
        Evento e = cargar(eventoId);
        if (!permisos.gestionaEvento(a, e)) {
            throw new AccesoDenegadoException("Solo quien organiza el evento puede registrar asistencia");
        }
        if (e.getInicio().isAfter(LocalDateTime.now())) {
            throw new ReglaNegocioException("La asistencia se registra cuando el evento ya empezó");
        }
        p.setAsistio(asistio);
        return ParticipacionDto.de(p);
    }

    // ------------------------------------------------------------------ apoyo

    private void aplicar(Evento e, EventoRequest req) {
        e.setTitulo(req.titulo().trim());
        e.setDescripcion(Consultas.limpiar(req.descripcion()));
        e.setUbicacion(Consultas.limpiar(req.ubicacion()));
        e.setInicio(req.inicio());
        e.setFin(req.fin());
        e.setTipo(req.tipo());
    }

    /** Estudiantes: solo eventos personales. Docentes: personales o de sus materias. Admin: cualquiera. */
    private Materia materiaPermitida(UsuarioPrincipal a, Long materiaId) {
        if (materiaId == null) return null;
        if (a.esEstudiante()) {
            throw ReglaNegocioException.campo("materiaId", "Los estudiantes solo crean eventos personales");
        }
        Materia m = materias.buscarDetalle(materiaId)
                .orElseThrow(() -> ReglaNegocioException.campo("materiaId", "La materia elegida no existe"));
        if (!permisos.gestionaMateria(a, m)) {
            throw new AccesoDenegadoException("Solo puedes programar eventos en las materias que impartes");
        }
        return m;
    }

    private Evento cargar(Long id) {
        return eventos.buscarDetalle(id).orElseThrow(() -> RecursoNoEncontradoException.de("Evento", id));
    }

    private List<EventoDto> aDtos(UsuarioPrincipal a, List<Evento> lista) {
        if (lista.isEmpty()) return List.of();
        List<Long> ids = lista.stream().map(Evento::getId).toList();
        Map<Long, long[]> conteos = Consultas.mapa(participaciones.conteoPorEvento(ids, RespuestaParticipacion.CONFIRMADA),
                f -> new long[]{Consultas.num(f[1]), Consultas.num(f[2])});
        Map<Long, RespuestaParticipacion> mias = Consultas.mapa(participaciones.respuestasDe(a.getId(), ids),
                f -> (RespuestaParticipacion) f[1]);
        return lista.stream().map(e -> {
            long[] c = conteos.getOrDefault(e.getId(), new long[]{0, 0});
            return EventoDto.de(e, mias.get(e.getId()), c[0], c[1]);
        }).toList();
    }
}
