package com.dianova.service;

import com.dianova.domain.*;
import com.dianova.domain.Enums.EstadoInscripcion;
import com.dianova.domain.Enums.EstadoPublicacion;
import com.dianova.domain.Enums.EstadoSeguimiento;
import com.dianova.domain.Enums.RolCodigo;
import com.dianova.dto.academico.AcademicoDtos.*;
import com.dianova.dto.comun.Mini.UsuarioMini;
import com.dianova.dto.comun.PaginaDto;
import com.dianova.exception.AccesoDenegadoException;
import com.dianova.exception.RecursoNoEncontradoException;
import com.dianova.exception.ReglaNegocioException;
import com.dianova.repository.*;
import com.dianova.security.UsuarioPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/** Materias, sus horarios y sus inscripciones (N:M estudiante-materia). */
@Service
@Transactional
public class MateriaService {

    private static final Map<String, String> ORDEN = Map.of("nombre", "nombre", "codigo", "codigoGrupo", "creditos", "creditos");

    private final MateriaRepository materias;
    private final PeriodoRepository periodos;
    private final UsuarioRepository usuarios;
    private final HorarioRepository horarios;
    private final InscripcionRepository inscripciones;
    private final SeguimientoRepository seguimientos;
    private final TareaRepository tareas;
    private final RecordatorioRepository recordatorios;
    private final Permisos permisos;

    public MateriaService(MateriaRepository materias, PeriodoRepository periodos, UsuarioRepository usuarios,
                          HorarioRepository horarios, InscripcionRepository inscripciones,
                          SeguimientoRepository seguimientos, TareaRepository tareas,
                          RecordatorioRepository recordatorios, Permisos permisos) {
        this.materias = materias;
        this.periodos = periodos;
        this.usuarios = usuarios;
        this.horarios = horarios;
        this.inscripciones = inscripciones;
        this.seguimientos = seguimientos;
        this.tareas = tareas;
        this.recordatorios = recordatorios;
        this.permisos = permisos;
    }

    // ------------------------------------------------------------------ materias

    /** Admin ve todas; docente, las que imparte; estudiante, en las que está inscrito. */
    @Transactional(readOnly = true)
    public PaginaDto<MateriaDto> listar(UsuarioPrincipal a, String q, Long periodoId, Long docenteId, int page, int size,
                                        String orden, String dir) {
        Long filtroDocente = a.esDocente() ? a.getId() : (a.esAdmin() ? docenteId : null);
        Long filtroEstudiante = a.esEstudiante() ? a.getId() : null;
        Sort sort = Sort.by(Consultas.direccion(dir), ORDEN.getOrDefault(orden, "nombre"));
        Page<Materia> pagina = materias.buscar(Consultas.like(q), periodoId, filtroDocente, filtroEstudiante,
                EstadoInscripcion.ACTIVA, Consultas.pagina(page, size, sort));
        return PaginaDto.de(pagina, aDtos(a, pagina.getContent()));
    }

    @Transactional(readOnly = true)
    public MateriaDto obtener(UsuarioPrincipal a, Long id) {
        Materia m = cargar(id);
        if (!permisos.puedeVerMateria(a, m)) {
            throw new AccesoDenegadoException("No estás inscrito ni impartes esta materia");
        }
        return aDtos(a, List.of(m)).getFirst();
    }

    public MateriaDto crear(UsuarioPrincipal a, MateriaRequest req) {
        PeriodoAcademico periodo = periodo(req.periodoId());
        if (materias.existsByPeriodoIdAndCodigoGrupoIgnoreCase(periodo.getId(), req.codigoGrupo().trim())) {
            throw ReglaNegocioException.campo("codigoGrupo", "Ya existe una materia con ese código en el periodo");
        }
        Materia m = new Materia();
        aplicar(m, req, periodo);
        materias.save(m);
        return aDtos(a, List.of(m)).getFirst();
    }

    public MateriaDto actualizar(UsuarioPrincipal a, Long id, MateriaRequest req) {
        Materia m = cargar(id);
        PeriodoAcademico periodo = periodo(req.periodoId());
        if (materias.existsByPeriodoIdAndCodigoGrupoIgnoreCaseAndIdNot(periodo.getId(), req.codigoGrupo().trim(), id)) {
            throw ReglaNegocioException.campo("codigoGrupo", "Ya existe una materia con ese código en el periodo");
        }
        aplicar(m, req, periodo);
        return aDtos(a, List.of(m)).getFirst();
    }

    /** Elimina la materia con sus horarios, inscripciones, tareas y eventos (ON DELETE CASCADE). */
    public void eliminar(Long id) {
        Materia m = cargar(id);
        recordatorios.borrarDeMateria(id);
        materias.delete(m);
    }

    private void aplicar(Materia m, MateriaRequest req, PeriodoAcademico periodo) {
        m.setPeriodo(periodo);
        m.setDocente(req.docenteId() == null ? null : docente(req.docenteId()));
        m.setCodigoGrupo(req.codigoGrupo().trim().toUpperCase());
        m.setNombre(req.nombre().trim());
        m.setCreditos(req.creditos());
        m.setColor(req.color().toUpperCase());
        m.setAula(Consultas.limpiar(req.aula()));
        m.setDescripcion(Consultas.limpiar(req.descripcion()));
    }

    /** Arma los DTO de una página con 2-4 consultas en total (horarios, inscritos y avance agrupados). */
    private List<MateriaDto> aDtos(UsuarioPrincipal a, List<Materia> lista) {
        if (lista.isEmpty()) return List.of();
        List<Long> ids = lista.stream().map(Materia::getId).toList();
        Map<Long, List<HorarioDto>> hs = horarios.deMaterias(ids).stream()
                .collect(Collectors.groupingBy(h -> h.getMateria().getId(),
                        Collectors.mapping(HorarioDto::de, Collectors.toList())));
        Map<Long, Long> inscritos = Consultas.mapa(inscripciones.contarPorMateria(ids, EstadoInscripcion.ACTIVA),
                f -> Consultas.num(f[1]));
        Map<Long, long[]> avance = a.esEstudiante()
                ? Consultas.mapa(seguimientos.avancePorMateria(a.getId(), ids, EstadoSeguimiento.COMPLETADA, EstadoPublicacion.PUBLICADA),
                f -> new long[]{Consultas.num(f[1]), Consultas.num(f[2])})
                : Map.of();
        return lista.stream().map(m -> {
            long[] av = avance.get(m.getId());
            Integer pct = a.esEstudiante() ? (av == null || av[0] == 0 ? 0 : (int) Math.round(av[1] * 100.0 / av[0])) : null;
            Long pendientes = a.esEstudiante() ? (av == null ? 0L : av[0] - av[1]) : null;
            return new MateriaDto(m.getId(), m.getCodigoGrupo(), m.getNombre(), m.getCreditos(), m.getColor(), m.getAula(),
                    m.getDescripcion(), PeriodoDto.de(m.getPeriodo()), UsuarioMini.de(m.getDocente()),
                    hs.getOrDefault(m.getId(), List.of()), inscritos.getOrDefault(m.getId(), 0L), pct, pendientes);
        }).toList();
    }

    // ------------------------------------------------------------------ horarios

    @Transactional(readOnly = true)
    public List<HorarioDto> horarios(UsuarioPrincipal a, Long materiaId) {
        Materia m = cargar(materiaId);
        if (!permisos.puedeVerMateria(a, m)) {
            throw new AccesoDenegadoException("No estás inscrito ni impartes esta materia");
        }
        return horarios.findByMateriaIdOrderByDiaSemanaAscHoraInicioAsc(materiaId).stream().map(HorarioDto::de).toList();
    }

    public HorarioDto crearHorario(Long materiaId, HorarioRequest req) {
        HorarioClase h = new HorarioClase();
        h.setMateria(cargar(materiaId));
        aplicar(h, req);
        return HorarioDto.de(horarios.save(h));
    }

    public HorarioDto actualizarHorario(Long materiaId, Long horarioId, HorarioRequest req) {
        HorarioClase h = horario(materiaId, horarioId);
        aplicar(h, req);
        return HorarioDto.de(h);
    }

    public void eliminarHorario(Long materiaId, Long horarioId) {
        horarios.delete(horario(materiaId, horarioId));
    }

    private void aplicar(HorarioClase h, HorarioRequest req) {
        h.setDiaSemana(req.diaSemana());
        h.setHoraInicio(req.horaInicio());
        h.setHoraFin(req.horaFin());
        h.setAula(Consultas.limpiar(req.aula()));
    }

    private HorarioClase horario(Long materiaId, Long horarioId) {
        HorarioClase h = horarios.findById(horarioId).orElseThrow(() -> RecursoNoEncontradoException.de("Horario", horarioId));
        if (!h.getMateria().getId().equals(materiaId)) {
            throw RecursoNoEncontradoException.de("Horario", horarioId);
        }
        return h;
    }

    // ------------------------------------------------------------------ inscripciones (N:M)

    /** Consultar estudiantes inscritos: administrador o docente de la materia. */
    @Transactional(readOnly = true)
    public PaginaDto<InscripcionDto> inscritos(UsuarioPrincipal a, Long materiaId, String q, EstadoInscripcion estado,
                                               int page, int size) {
        Materia m = cargar(materiaId);
        if (!permisos.gestionaMateria(a, m)) {
            throw new AccesoDenegadoException("Solo el docente de la materia o un administrador pueden ver sus inscritos");
        }
        return PaginaDto.de(inscripciones.inscritos(materiaId, estado, Consultas.like(q),
                Consultas.pagina(page, size, Sort.by("estudiante.apellidos", "estudiante.nombre"))), InscripcionDto::de);
    }

    /** Inscribe (o reactiva) a un estudiante y le crea el seguimiento de las tareas ya publicadas. */
    public InscripcionDto inscribir(Long materiaId, InscripcionRequest req) {
        Materia m = cargar(materiaId);
        Usuario e = usuarios.buscarConRol(req.estudianteId())
                .orElseThrow(() -> RecursoNoEncontradoException.de("Usuario", req.estudianteId()));
        if (!e.tieneRol(RolCodigo.ESTUDIANTE)) {
            throw ReglaNegocioException.campo("estudianteId", "Solo se pueden inscribir usuarios con rol estudiante");
        }
        Inscripcion i = inscripciones.findByEstudianteIdAndMateriaId(e.getId(), materiaId).orElse(null);
        if (i != null && i.getEstado() == EstadoInscripcion.ACTIVA) {
            throw ReglaNegocioException.campo("estudianteId", "El estudiante ya está inscrito en esta materia");
        }
        if (i == null) {
            i = new Inscripcion();
            i.setEstudiante(e);
            i.setMateria(m);
        }
        i.setEstado(EstadoInscripcion.ACTIVA);
        inscripciones.save(i);
        sincronizarSeguimientos(m, e);
        return InscripcionDto.de(i);
    }

    public InscripcionDto cambiarEstadoInscripcion(Long inscripcionId, EstadoInscripcion estado) {
        Inscripcion i = inscripciones.buscarDetalle(inscripcionId)
                .orElseThrow(() -> RecursoNoEncontradoException.de("Inscripción", inscripcionId));
        i.setEstado(estado);
        if (estado == EstadoInscripcion.ACTIVA) {
            sincronizarSeguimientos(i.getMateria(), i.getEstudiante());
        }
        return InscripcionDto.de(i);
    }

    public void eliminarInscripcion(Long inscripcionId) {
        Inscripcion i = inscripciones.findById(inscripcionId)
                .orElseThrow(() -> RecursoNoEncontradoException.de("Inscripción", inscripcionId));
        inscripciones.delete(i);
    }

    private void sincronizarSeguimientos(Materia m, Usuario e) {
        tareas.findByMateriaIdAndEstadoPublicacion(m.getId(), EstadoPublicacion.PUBLICADA)
                .forEach(t -> {
                    if (!seguimientos.existsByTareaIdAndEstudianteId(t.getId(), e.getId())) {
                        seguimientos.save(new SeguimientoTarea(t, e));
                    }
                });
    }

    // ------------------------------------------------------------------ apoyo

    private Materia cargar(Long id) {
        return materias.buscarDetalle(id).orElseThrow(() -> RecursoNoEncontradoException.de("Materia", id));
    }

    private PeriodoAcademico periodo(Long id) {
        return periodos.findById(id).orElseThrow(() -> ReglaNegocioException.campo("periodoId", "El periodo elegido no existe"));
    }

    private Usuario docente(Long id) {
        Usuario d = usuarios.buscarConRol(id).orElseThrow(() -> ReglaNegocioException.campo("docenteId", "El docente elegido no existe"));
        if (!d.tieneRol(RolCodigo.DOCENTE)) {
            throw ReglaNegocioException.campo("docenteId", "El usuario elegido no tiene rol de docente");
        }
        return d;
    }
}
