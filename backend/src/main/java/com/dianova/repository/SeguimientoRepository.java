package com.dianova.repository;

import com.dianova.domain.Enums.EstadoPublicacion;
import com.dianova.domain.Enums.EstadoSeguimiento;
import com.dianova.domain.Enums.OrigenTarea;
import com.dianova.domain.Enums.Prioridad;
import com.dianova.domain.SeguimientoTarea;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface SeguimientoRepository extends JpaRepository<SeguimientoTarea, Long> {

    /** Tareas del estudiante a través de su seguimiento (vista "Mis tareas"). Todo en un solo SELECT. */
    @Query(value = """
            select s from SeguimientoTarea s join fetch s.tarea t join fetch t.creador left join fetch t.materia m
            where s.estudiante.id = :estudianteId and t.estadoPublicacion = :publicada
              and (:q is null or lower(t.titulo) like :q or lower(t.descripcion) like :q)
              and (:materiaId is null or m.id = :materiaId)
              and (:prioridad is null or t.prioridad = :prioridad)
              and (:estado is null or s.estado = :estado)
              and (:pendientes = false or s.estado <> :completada)
              and (:origen is null or t.origen = :origen)
              and (:desde is null or t.fechaEntrega >= :desde)
              and (:hasta is null or t.fechaEntrega < :hasta)
            """,
            countQuery = """
            select count(s) from SeguimientoTarea s join s.tarea t left join t.materia m
            where s.estudiante.id = :estudianteId and t.estadoPublicacion = :publicada
              and (:q is null or lower(t.titulo) like :q or lower(t.descripcion) like :q)
              and (:materiaId is null or m.id = :materiaId)
              and (:prioridad is null or t.prioridad = :prioridad)
              and (:estado is null or s.estado = :estado)
              and (:pendientes = false or s.estado <> :completada)
              and (:origen is null or t.origen = :origen)
              and (:desde is null or t.fechaEntrega >= :desde)
              and (:hasta is null or t.fechaEntrega < :hasta)
            """)
    Page<SeguimientoTarea> deEstudiante(@Param("estudianteId") Long estudianteId,
                                        @Param("publicada") EstadoPublicacion publicada,
                                        @Param("q") String q, @Param("materiaId") Long materiaId,
                                        @Param("prioridad") Prioridad prioridad, @Param("estado") EstadoSeguimiento estado,
                                        @Param("pendientes") boolean pendientes,
                                        @Param("completada") EstadoSeguimiento completada,
                                        @Param("origen") OrigenTarea origen,
                                        @Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta,
                                        Pageable pageable);

    /** Avance de cada estudiante en una tarea (vista del docente). */
    @Query(value = """
            select s from SeguimientoTarea s join fetch s.estudiante e
            where s.tarea.id = :tareaId and (:estado is null or s.estado = :estado)
              and (:q is null or lower(e.nombre) like :q or lower(e.apellidos) like :q or lower(e.correo) like :q)
            """,
            countQuery = """
            select count(s) from SeguimientoTarea s join s.estudiante e
            where s.tarea.id = :tareaId and (:estado is null or s.estado = :estado)
              and (:q is null or lower(e.nombre) like :q or lower(e.apellidos) like :q or lower(e.correo) like :q)
            """)
    Page<SeguimientoTarea> deTarea(@Param("tareaId") Long tareaId, @Param("estado") EstadoSeguimiento estado,
                                   @Param("q") String q, Pageable pageable);

    Optional<SeguimientoTarea> findByTareaIdAndEstudianteId(Long tareaId, Long estudianteId);

    boolean existsByTareaIdAndEstudianteId(Long tareaId, Long estudianteId);

    /** Mis seguimientos para un conjunto de tareas: [idTarea -> seguimiento]. */
    @Query("select s from SeguimientoTarea s where s.estudiante.id = :estudianteId and s.tarea.id in :ids")
    List<SeguimientoTarea> deEstudianteEnTareas(@Param("estudianteId") Long estudianteId, @Param("ids") Collection<Long> ids);

    /** [idTarea, total, completadas, enProceso] para una página de tareas, en una sola consulta agregada. */
    @Query("""
            select s.tarea.id, count(s),
                   sum(case when s.estado = :completada then 1 else 0 end),
                   sum(case when s.estado = :enProceso then 1 else 0 end)
            from SeguimientoTarea s where s.tarea.id in :ids group by s.tarea.id
            """)
    List<Object[]> avancePorTarea(@Param("ids") Collection<Long> ids,
                                  @Param("completada") EstadoSeguimiento completada,
                                  @Param("enProceso") EstadoSeguimiento enProceso);

    /** [idMateria, total, completadas] del estudiante en varias materias. */
    @Query("""
            select t.materia.id, count(s), sum(case when s.estado = :completada then 1 else 0 end)
            from SeguimientoTarea s join s.tarea t
            where s.estudiante.id = :estudianteId and t.materia.id in :ids and t.estadoPublicacion = :publicada
            group by t.materia.id
            """)
    List<Object[]> avancePorMateria(@Param("estudianteId") Long estudianteId, @Param("ids") Collection<Long> ids,
                                    @Param("completada") EstadoSeguimiento completada,
                                    @Param("publicada") EstadoPublicacion publicada);

    @Query("""
            select count(s) from SeguimientoTarea s join s.tarea t
            where s.estudiante.id = :estudianteId and t.estadoPublicacion = :publicada and s.estado <> :completada
              and (:prioridad is null or t.prioridad = :prioridad)
            """)
    long contarPendientes(@Param("estudianteId") Long estudianteId, @Param("publicada") EstadoPublicacion publicada,
                          @Param("completada") EstadoSeguimiento completada, @Param("prioridad") Prioridad prioridad);

    /** [total, completadas] de las tareas con entrega dentro del rango (progreso semanal). */
    @Query("""
            select count(s), sum(case when s.estado = :completada then 1 else 0 end)
            from SeguimientoTarea s join s.tarea t
            where s.estudiante.id = :estudianteId and t.estadoPublicacion = :publicada
              and t.fechaEntrega >= :desde and t.fechaEntrega < :hasta
            """)
    List<Object[]> progresoEnRango(@Param("estudianteId") Long estudianteId, @Param("publicada") EstadoPublicacion publicada,
                                   @Param("completada") EstadoSeguimiento completada,
                                   @Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);

    /** Entregas pendientes de los estudiantes en las tareas de un docente. */
    @Query("""
            select count(s) from SeguimientoTarea s join s.tarea t left join t.materia m
            where (t.creador.id = :docenteId or m.docente.id = :docenteId) and s.estado <> :completada
              and t.estadoPublicacion = :publicada
            """)
    long contarPendientesDeDocente(@Param("docenteId") Long docenteId, @Param("completada") EstadoSeguimiento completada,
                                   @Param("publicada") EstadoPublicacion publicada);
}
