package com.dianova.service;

import com.dianova.domain.*;
import com.dianova.domain.Enums.*;
import com.dianova.dto.comun.PaginaDto;
import com.dianova.dto.tarea.TareaDtos.*;
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
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Tareas: personales (estudiante) o de materia (docente). Flujo de la figura 5:
 * validar datos y permisos -> guardar -> crear seguimientos individuales -> programar avisos según consentimiento.
 */
@Service
@Transactional
public class TareaService {

    private static final Map<String, String> ORDEN = Map.of("entrega", "fechaEntrega", "creado", "creadoEn", "titulo", "titulo");

    private final TareaRepository tareas;
    private final SeguimientoRepository seguimientos;
    private final MateriaRepository materias;
    private final UsuarioRepository usuarios;
    private final InscripcionRepository inscripciones;
    private final RecordatorioRepository recordatorios;
    private final NotificacionService notificaciones;
    private final Permisos permisos;

    public TareaService(TareaRepository tareas, SeguimientoRepository seguimientos, MateriaRepository materias,
                        UsuarioRepository usuarios, InscripcionRepository inscripciones,
                        RecordatorioRepository recordatorios, NotificacionService notificaciones, Permisos permisos) {
        this.tareas = tareas;
        this.seguimientos = seguimientos;
        this.materias = materias;
        this.usuarios = usuarios;
        this.inscripciones = inscripciones;
        this.recordatorios = recordatorios;
        this.notificaciones = notificaciones;
        this.permisos = permisos;
    }

    public record Filtros(String q, Long materiaId, Prioridad prioridad, EstadoSeguimiento estado, boolean pendientes,
                          EstadoPublicacion publicacion, OrigenTarea origen, LocalDateTime desde, LocalDateTime hasta,
                          String orden, String dir) {
    }

    // ------------------------------------------------------------------ consultas

    @Transactional(readOnly = true)
    public PaginaDto<TareaDto> listar(UsuarioPrincipal a, Filtros f, int page, int size) {
        String campo = ORDEN.getOrDefault(f.orden(), "fechaEntrega");
        Sort.Direction dir = Consultas.direccion(f.dir());
        if (a.esEstudiante()) {
            Page<SeguimientoTarea> p = seguimientos.deEstudiante(a.getId(), EstadoPublicacion.PUBLICADA, Consultas.like(f.q()),
                    f.materiaId(), f.prioridad(), f.estado(), f.pendientes(), EstadoSeguimiento.COMPLETADA, f.origen(),
                    f.desde(), f.hasta(), Consultas.pagina(page, size, Sort.by(dir, "tarea." + campo)));
            return PaginaDto.de(p, s -> TareaDto.de(s.getTarea(), SeguimientoMini.de(s), null));
        }
        Long responsable = a.esAdmin() ? null : a.getId();
        Page<Tarea> p = tareas.buscar(responsable, Consultas.like(f.q()), f.materiaId(), f.prioridad(), f.publicacion(),
                f.origen(), f.desde(), f.hasta(), Consultas.pagina(page, size, Sort.by(dir, campo)));
        return PaginaDto.de(p, conAvance(p.getContent()));
    }

    @Transactional(readOnly = true)
    public TareaDto obtener(UsuarioPrincipal a, Long id) {
        Tarea t = cargar(id);
        if (!permisos.puedeVerTarea(a, t)) {
            throw new AccesoDenegadoException("No tienes acceso a esta tarea");
        }
        return aDto(a, t);
    }

    /** Avance de cada estudiante en la tarea (docente o administrador). */
    @Transactional(readOnly = true)
    public PaginaDto<SeguimientoDto> seguimientos(UsuarioPrincipal a, Long tareaId, EstadoSeguimiento estado, String q,
                                                  int page, int size) {
        Tarea t = cargar(tareaId);
        if (!permisos.gestionaTarea(a, t)) {
            throw new AccesoDenegadoException("Solo quien gestiona la tarea puede ver el avance del grupo");
        }
        return PaginaDto.de(seguimientos.deTarea(tareaId, estado, Consultas.like(q),
                Consultas.pagina(page, size, Sort.by("estudiante.apellidos"))), SeguimientoDto::de);
    }

    // ------------------------------------------------------------------ escritura

    public TareaDto crear(UsuarioPrincipal a, TareaRequest req) {
        Usuario creador = usuarios.buscarConRol(a.getId()).orElseThrow();
        Tarea t = new Tarea();
        t.setCreador(creador);
        aplicarCampos(t, req);
        if (a.esEstudiante()) {
            // Tarea personal: puede ligarse a una materia en la que esté inscrito
            Materia m = req.materiaId() == null ? null : materiaInscrita(a, req.materiaId());
            t.setMateria(m);
            t.setOrigen(OrigenTarea.PERSONAL);
            t.setEstadoPublicacion(EstadoPublicacion.PUBLICADA);
            t.setPublicadaEn(LocalDateTime.now());
            tareas.save(t);
            seguimientos.save(new SeguimientoTarea(t, creador));
            return aDto(a, t);
        }
        // Docente o administrador: tarea de materia, en borrador o publicada
        t.setMateria(materiaGestionada(a, req.materiaId()));
        t.setOrigen(OrigenTarea.DOCENTE);
        t.setEstadoPublicacion(EstadoPublicacion.BORRADOR);
        tareas.save(t);
        if (!Boolean.FALSE.equals(req.publicar())) {
            publicarInterno(t);
        }
        return aDto(a, t);
    }

    public TareaDto actualizar(UsuarioPrincipal a, Long id, TareaRequest req) {
        Tarea t = cargar(id);
        if (!permisos.gestionaTarea(a, t)) {
            throw new AccesoDenegadoException("Solo quien creó la tarea, el docente de la materia o un administrador pueden editarla");
        }
        aplicarCampos(t, req);
        if (t.getOrigen() == OrigenTarea.PERSONAL) {
            t.setMateria(req.materiaId() == null ? null : materiaInscrita(a, req.materiaId()));
        } else if (t.getEstadoPublicacion() == EstadoPublicacion.BORRADOR) {
            t.setMateria(materiaGestionada(a, req.materiaId()));
        } else if (req.materiaId() != null && !req.materiaId().equals(t.getMateria().getId())) {
            throw ReglaNegocioException.campo("materiaId", "Una tarea publicada no puede cambiar de materia");
        }
        if (t.getOrigen() == OrigenTarea.DOCENTE && Boolean.TRUE.equals(req.publicar())
                && t.getEstadoPublicacion() == EstadoPublicacion.BORRADOR) {
            publicarInterno(t);
        }
        return aDto(a, t);
    }

    /** BORRADOR -> PUBLICADA (diagrama de estados): crea seguimientos y programa avisos. */
    public TareaDto publicar(UsuarioPrincipal a, Long id) {
        Tarea t = cargar(id);
        if (!permisos.gestionaTarea(a, t)) {
            throw new AccesoDenegadoException("No puedes publicar esta tarea");
        }
        if (t.getEstadoPublicacion() == EstadoPublicacion.PUBLICADA) {
            throw new ReglaNegocioException("La tarea ya está publicada");
        }
        publicarInterno(t);
        return aDto(a, t);
    }

    public void eliminar(UsuarioPrincipal a, Long id) {
        Tarea t = cargar(id);
        if (!permisos.gestionaTarea(a, t)) {
            throw new AccesoDenegadoException("No puedes eliminar esta tarea");
        }
        recordatorios.borrarDeTarea(id);
        tareas.delete(t);
    }

    /**
     * Avance del estudiante: PENDIENTE -> EN_PROCESO -> COMPLETADA, y COMPLETADA -> EN_PROCESO (reabrir).
     * Se permite marcar COMPLETADA directo desde PENDIENTE (casilla de la lista).
     */
    public TareaDto actualizarProgreso(UsuarioPrincipal a, Long tareaId, EstadoSeguimiento nuevo) {
        SeguimientoTarea s = seguimientos.findByTareaIdAndEstudianteId(tareaId, a.getId())
                .orElseThrow(() -> new AccesoDenegadoException("Esta tarea no está asignada a tu cuenta"));
        if (s.getTarea().getEstadoPublicacion() != EstadoPublicacion.PUBLICADA) {
            throw new ReglaNegocioException("La tarea aún no está publicada");
        }
        if (s.getEstado() == EstadoSeguimiento.COMPLETADA && nuevo == EstadoSeguimiento.PENDIENTE) {
            throw ReglaNegocioException.campo("estado", "Una tarea completada se reabre como 'En proceso', no como 'Pendiente'");
        }
        if (s.getEstado() != nuevo) {
            s.cambiarEstado(nuevo);
        }
        return aDto(a, cargar(tareaId));
    }

    // ------------------------------------------------------------------ apoyo

    private void publicarInterno(Tarea t) {
        t.setEstadoPublicacion(EstadoPublicacion.PUBLICADA);
        t.setPublicadaEn(LocalDateTime.now());
        List<Usuario> estudiantes = inscripciones.estudiantesDe(t.getMateria().getId(), EstadoInscripcion.ACTIVA);
        for (Usuario e : estudiantes) {
            if (!seguimientos.existsByTareaIdAndEstudianteId(t.getId(), e.getId())) {
                seguimientos.save(new SeguimientoTarea(t, e));
            }
        }
        notificaciones.programarAvisosTareaPublicada(t, estudiantes);
    }

    private void aplicarCampos(Tarea t, TareaRequest req) {
        t.setTitulo(req.titulo().trim());
        t.setDescripcion(Consultas.limpiar(req.descripcion()));
        t.setFechaEntrega(req.fechaEntrega());
        t.setPrioridad(req.prioridad());
    }

    private Materia materiaInscrita(UsuarioPrincipal a, Long materiaId) {
        Materia m = materias.buscarDetalle(materiaId)
                .orElseThrow(() -> ReglaNegocioException.campo("materiaId", "La materia elegida no existe"));
        if (!permisos.inscritoEn(a, m)) {
            throw ReglaNegocioException.campo("materiaId", "Solo puedes ligar tareas a materias en las que estás inscrito");
        }
        return m;
    }

    private Materia materiaGestionada(UsuarioPrincipal a, Long materiaId) {
        if (materiaId == null) {
            throw ReglaNegocioException.campo("materiaId", "Elige la materia de la tarea");
        }
        Materia m = materias.buscarDetalle(materiaId)
                .orElseThrow(() -> ReglaNegocioException.campo("materiaId", "La materia elegida no existe"));
        if (!permisos.gestionaMateria(a, m)) {
            throw new AccesoDenegadoException("Solo puedes publicar tareas en las materias que impartes");
        }
        return m;
    }

    private Tarea cargar(Long id) {
        return tareas.buscarDetalle(id).orElseThrow(() -> RecursoNoEncontradoException.de("Tarea", id));
    }

    private TareaDto aDto(UsuarioPrincipal a, Tarea t) {
        SeguimientoMini mio = seguimientos.findByTareaIdAndEstudianteId(t.getId(), a.getId()).map(SeguimientoMini::de).orElse(null);
        AvanceDto avance = permisos.gestionaTarea(a, t) && t.getOrigen() == OrigenTarea.DOCENTE
                ? conAvance(List.of(t)).apply(t).avance() : null;
        return TareaDto.de(t, mio, avance);
    }

    /** Agrega el avance del grupo a una página de tareas con una sola consulta agrupada. */
    private Function<Tarea, TareaDto> conAvance(List<Tarea> lista) {
        if (lista.isEmpty()) return t -> TareaDto.de(t, null, null);
        Map<Long, AvanceDto> avance = seguimientos.avancePorTarea(lista.stream().map(Tarea::getId).toList(),
                        EstadoSeguimiento.COMPLETADA, EstadoSeguimiento.EN_PROCESO).stream()
                .collect(Collectors.toMap(f -> (Long) f[0],
                        f -> new AvanceDto(Consultas.num(f[1]), Consultas.num(f[2]), Consultas.num(f[3]))));
        return t -> TareaDto.de(t, null, avance.getOrDefault(t.getId(), AvanceDto.VACIO));
    }
}
