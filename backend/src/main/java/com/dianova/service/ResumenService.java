package com.dianova.service;

import com.dianova.domain.*;
import com.dianova.domain.Enums.*;
import com.dianova.dto.evento.EventoDtos.EventoDto;
import com.dianova.dto.resumen.ResumenDtos.*;
import com.dianova.dto.tarea.TareaDtos.SeguimientoMini;
import com.dianova.dto.tarea.TareaDtos.TareaDto;
import com.dianova.exception.ReglaNegocioException;
import com.dianova.repository.*;
import com.dianova.security.UsuarioPrincipal;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/** Panel "Resumen" por rol y calendario combinado (clases + eventos + entregas). */
@Service
@Transactional(readOnly = true)
public class ResumenService {

    private static final long MAX_DIAS_CALENDARIO = 62;

    private final SeguimientoRepository seguimientos;
    private final TareaRepository tareas;
    private final MateriaRepository materias;
    private final HorarioRepository horarios;
    private final InscripcionRepository inscripciones;
    private final RecordatorioRepository recordatorios;
    private final UsuarioRepository usuarios;
    private final EventoRepository eventosRepo;
    private final EventoService eventos;
    private final TareaService tareaService;

    public ResumenService(SeguimientoRepository seguimientos, TareaRepository tareas, MateriaRepository materias,
                          HorarioRepository horarios, InscripcionRepository inscripciones,
                          RecordatorioRepository recordatorios, UsuarioRepository usuarios, EventoRepository eventosRepo,
                          EventoService eventos, TareaService tareaService) {
        this.seguimientos = seguimientos;
        this.tareas = tareas;
        this.materias = materias;
        this.horarios = horarios;
        this.inscripciones = inscripciones;
        this.recordatorios = recordatorios;
        this.usuarios = usuarios;
        this.eventosRepo = eventosRepo;
        this.eventos = eventos;
        this.tareaService = tareaService;
    }

    public ResumenDto resumen(UsuarioPrincipal a) {
        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime hoy = ahora.toLocalDate().atStartOfDay();
        LocalDateTime manana = hoy.plusDays(1);
        List<HorarioClase> misHorarios = horarios.deMaterias(misMaterias(a));
        List<EventoDto> eventosHoy = eventos.enRango(a, hoy, manana, null, null);
        List<EventoDto> proximos = eventos.listar(a, new EventoService.Filtros(null, null, null, EstadoEvento.PROGRAMADO,
                ahora, null, "asc"), 0, 4).contenido();
        ClaseDto proxima = proximaClase(misHorarios, ahora);

        List<MetricaDto> metricas = new ArrayList<>();
        Integer progreso = null;
        List<TareaDto> prioritarias;
        List<AgendaItemDto> agenda = new ArrayList<>(clasesEnRango(misHorarios, hoy, manana));
        eventosHoy.forEach(e -> agenda.add(deEvento(e)));

        if (a.esEstudiante()) {
            LocalDateTime lunes = hoy.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            Object[] semana = seguimientos.progresoEnRango(a.getId(), EstadoPublicacion.PUBLICADA, EstadoSeguimiento.COMPLETADA,
                    lunes, lunes.plusWeeks(1)).getFirst();
            long total = Consultas.num(semana[0]);
            long hechas = Consultas.num(semana[1]);
            progreso = total == 0 ? 0 : (int) Math.round(hechas * 100.0 / total);
            long pendientes = seguimientos.contarPendientes(a.getId(), EstadoPublicacion.PUBLICADA, EstadoSeguimiento.COMPLETADA, null);
            long altas = seguimientos.contarPendientes(a.getId(), EstadoPublicacion.PUBLICADA, EstadoSeguimiento.COMPLETADA, Prioridad.ALTA);
            long recHoy = recordatorios.contarDeUsuarioEnRango(a.getId(), EstadoRecordatorio.PENDIENTE, hoy, manana);
            metricas.add(new MetricaDto("progreso", "Progreso semanal", progreso, hechas + " de " + total + " entregas de esta semana"));
            metricas.add(new MetricaDto("pendientes", "Tareas pendientes", pendientes, altas + " de alta prioridad"));
            metricas.add(new MetricaDto("recordatorios", "Recordatorios hoy", recHoy, "programados para hoy"));
            prioritarias = seguimientos.deEstudiante(a.getId(), EstadoPublicacion.PUBLICADA, null, null, null, null, true,
                            EstadoSeguimiento.COMPLETADA, null, null, null,
                            PageRequest.of(0, 5, Sort.by("tarea.fechaEntrega")))
                    .map(s -> TareaDto.de(s.getTarea(), SeguimientoMini.de(s), null)).getContent();
            seguimientos.deEstudiante(a.getId(), EstadoPublicacion.PUBLICADA, null, null, null, null, true,
                            EstadoSeguimiento.COMPLETADA, null, hoy, manana, PageRequest.of(0, 20))
                    .forEach(s -> agenda.add(deTarea(s.getTarea())));
        } else if (a.esDocente()) {
            metricas.add(new MetricaDto("materias", "Materias que impartes", materias.countByDocenteId(a.getId()), "en el sistema"));
            metricas.add(new MetricaDto("publicadas", "Tareas publicadas", tareas.contarDeDocente(a.getId(), EstadoPublicacion.PUBLICADA),
                    tareas.contarDeDocente(a.getId(), EstadoPublicacion.BORRADOR) + " en borrador"));
            metricas.add(new MetricaDto("entregas", "Entregas pendientes",
                    seguimientos.contarPendientesDeDocente(a.getId(), EstadoSeguimiento.COMPLETADA, EstadoPublicacion.PUBLICADA),
                    "de tus estudiantes"));
            prioritarias = tareaService.listar(a, new TareaService.Filtros(null, null, null, null, false,
                    EstadoPublicacion.PUBLICADA, null, ahora, null, "entrega", "asc"), 0, 5).contenido();
        } else {
            metricas.add(new MetricaDto("estudiantes", "Estudiantes activos", usuarios.contarActivosPorRol(RolCodigo.ESTUDIANTE),
                    usuarios.contarActivosPorRol(RolCodigo.DOCENTE) + " docentes activos"));
            metricas.add(new MetricaDto("materias", "Materias", materias.count(),
                    inscripciones.countByEstado(EstadoInscripcion.ACTIVA) + " inscripciones activas"));
            metricas.add(new MetricaDto("tareas", "Tareas publicadas", tareas.countByEstadoPublicacion(EstadoPublicacion.PUBLICADA),
                    eventosRepo.countByInicioGreaterThanEqual(hoy) + " eventos próximos"));
            metricas.add(new MetricaDto("recordatorios", "Recordatorios pendientes", recordatorios.countByEstado(EstadoRecordatorio.PENDIENTE),
                    recordatorios.countByEstado(EstadoRecordatorio.FALLIDO) + " fallidos por revisar"));
            prioritarias = tareaService.listar(a, new TareaService.Filtros(null, null, null, null, false,
                    EstadoPublicacion.PUBLICADA, null, ahora, null, "entrega", "asc"), 0, 5).contenido();
        }
        agenda.sort(Comparator.comparing(AgendaItemDto::inicio));
        return new ResumenDto(a.getRol(), metricas, progreso, proxima, agenda, prioritarias, proximos);
    }

    /** Clases (de los horarios), eventos y entregas entre dos fechas. Rango máximo de 62 días. */
    public List<AgendaItemDto> calendario(UsuarioPrincipal a, LocalDate desde, LocalDate hasta, Long materiaId) {
        if (!hasta.isAfter(desde)) {
            throw ReglaNegocioException.campo("hasta", "La fecha final debe ser posterior a la inicial");
        }
        if (ChronoUnit.DAYS.between(desde, hasta) > MAX_DIAS_CALENDARIO) {
            throw ReglaNegocioException.campo("hasta", "Consulta como máximo " + MAX_DIAS_CALENDARIO + " días a la vez");
        }
        LocalDateTime ini = desde.atStartOfDay();
        LocalDateTime fin = hasta.atStartOfDay();
        List<Long> ids = misMaterias(a).stream().filter(id -> materiaId == null || id.equals(materiaId)).toList();
        List<AgendaItemDto> items = new ArrayList<>(clasesEnRango(horarios.deMaterias(ids), ini, fin));
        eventos.enRango(a, ini, fin, materiaId, null).forEach(e -> items.add(deEvento(e)));
        if (a.esEstudiante()) {
            seguimientos.deEstudiante(a.getId(), EstadoPublicacion.PUBLICADA, null, materiaId, null, null, false,
                            EstadoSeguimiento.COMPLETADA, null, ini, fin, PageRequest.of(0, 300))
                    .forEach(s -> items.add(deTarea(s.getTarea())));
        } else {
            tareas.buscar(a.esAdmin() ? null : a.getId(), null, materiaId, null, EstadoPublicacion.PUBLICADA, null, ini, fin,
                    PageRequest.of(0, 300)).forEach(t -> items.add(deTarea(t)));
        }
        items.sort(Comparator.comparing(AgendaItemDto::inicio));
        return items;
    }

    // ------------------------------------------------------------------ apoyo

    /** Materias del usuario: inscritas (estudiante) o impartidas (docente). El admin no tiene clases propias. */
    private List<Long> misMaterias(UsuarioPrincipal a) {
        if (a.esEstudiante()) return inscripciones.materiasDe(a.getId(), EstadoInscripcion.ACTIVA);
        if (a.esDocente()) {
            return materias.buscar(null, null, a.getId(), null, EstadoInscripcion.ACTIVA, PageRequest.of(0, 100))
                    .map(Materia::getId).getContent();
        }
        return List.of();
    }

    private List<AgendaItemDto> clasesEnRango(List<HorarioClase> hs, LocalDateTime desde, LocalDateTime hasta) {
        List<AgendaItemDto> out = new ArrayList<>();
        for (LocalDate d = desde.toLocalDate(); d.isBefore(hasta.toLocalDate()); d = d.plusDays(1)) {
            int dia = d.getDayOfWeek().getValue();
            for (HorarioClase h : hs) {
                if (h.getDiaSemana() == dia) {
                    Materia m = h.getMateria();
                    out.add(new AgendaItemDto("CLASE", m.getCodigoGrupo(), m.getId(), m.getNombre(),
                            m.getDocente() != null ? m.getDocente().getNombreCompleto() : null,
                            h.getAula() != null ? h.getAula() : m.getAula(), m.getColor(),
                            d.atTime(h.getHoraInicio()), d.atTime(h.getHoraFin())));
                }
            }
        }
        return out;
    }

    private ClaseDto proximaClase(List<HorarioClase> hs, LocalDateTime ahora) {
        return clasesEnRango(hs, ahora.toLocalDate().atStartOfDay(), ahora.toLocalDate().plusDays(8).atStartOfDay()).stream()
                .filter(c -> c.fin().isAfter(ahora))
                .min(Comparator.comparing(AgendaItemDto::inicio))
                .map(c -> new ClaseDto(c.referenciaId(), c.titulo(), c.color(), c.lugar(), c.detalle(), c.inicio(), c.fin()))
                .orElse(null);
    }

    private AgendaItemDto deEvento(EventoDto e) {
        return new AgendaItemDto("EVENTO", e.tipo().name(), e.id(), e.titulo(),
                e.materia() != null ? e.materia().nombre() : "Personal", e.ubicacion(),
                e.materia() != null ? e.materia().color() : null, e.inicio(), e.fin());
    }

    private AgendaItemDto deTarea(Tarea t) {
        return new AgendaItemDto("ENTREGA", t.getPrioridad().name(), t.getId(), t.getTitulo(),
                t.getMateria() != null ? t.getMateria().getNombre() : "Tarea personal", null,
                t.getMateria() != null ? t.getMateria().getColor() : null, t.getFechaEntrega(), t.getFechaEntrega());
    }
}
