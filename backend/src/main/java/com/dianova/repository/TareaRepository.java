package com.dianova.repository;

import com.dianova.domain.Enums.EstadoPublicacion;
import com.dianova.domain.Enums.OrigenTarea;
import com.dianova.domain.Enums.Prioridad;
import com.dianova.domain.Tarea;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface TareaRepository extends JpaRepository<Tarea, Long> {

    /**
     * Definiciones de tareas (vista de docente y administrador).
     * responsableId: si viene, solo tareas creadas por él o de materias que imparte.
     */
    @Query(value = """
            select t from Tarea t join fetch t.creador c left join fetch t.materia m
            where (:responsableId is null or c.id = :responsableId or m.docente.id = :responsableId)
              and (:q is null or lower(t.titulo) like :q or lower(t.descripcion) like :q)
              and (:materiaId is null or m.id = :materiaId)
              and (:prioridad is null or t.prioridad = :prioridad)
              and (:publicacion is null or t.estadoPublicacion = :publicacion)
              and (:origen is null or t.origen = :origen)
              and (:desde is null or t.fechaEntrega >= :desde)
              and (:hasta is null or t.fechaEntrega < :hasta)
            """,
            countQuery = """
            select count(t) from Tarea t join t.creador c left join t.materia m
            where (:responsableId is null or c.id = :responsableId or m.docente.id = :responsableId)
              and (:q is null or lower(t.titulo) like :q or lower(t.descripcion) like :q)
              and (:materiaId is null or m.id = :materiaId)
              and (:prioridad is null or t.prioridad = :prioridad)
              and (:publicacion is null or t.estadoPublicacion = :publicacion)
              and (:origen is null or t.origen = :origen)
              and (:desde is null or t.fechaEntrega >= :desde)
              and (:hasta is null or t.fechaEntrega < :hasta)
            """)
    Page<Tarea> buscar(@Param("responsableId") Long responsableId, @Param("q") String q,
                       @Param("materiaId") Long materiaId, @Param("prioridad") Prioridad prioridad,
                       @Param("publicacion") EstadoPublicacion publicacion, @Param("origen") OrigenTarea origen,
                       @Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta, Pageable pageable);

    @Query("""
            select t from Tarea t join fetch t.creador c join fetch c.rol
            left join fetch t.materia m left join fetch m.docente
            where t.id = :id
            """)
    Optional<Tarea> buscarDetalle(@Param("id") Long id);

    long countByEstadoPublicacion(EstadoPublicacion estado);

    java.util.List<Tarea> findByMateriaIdAndEstadoPublicacion(Long materiaId, EstadoPublicacion estado);

    @Query("""
            select count(t) from Tarea t left join t.materia m
            where (t.creador.id = :docenteId or m.docente.id = :docenteId) and t.estadoPublicacion = :publicacion
            """)
    long contarDeDocente(@Param("docenteId") Long docenteId, @Param("publicacion") EstadoPublicacion publicacion);
}
