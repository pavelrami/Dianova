package com.dianova.repository;

import com.dianova.domain.Enums.EstadoInscripcion;
import com.dianova.domain.Inscripcion;
import com.dianova.domain.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface InscripcionRepository extends JpaRepository<Inscripcion, Long> {

    /** Estudiantes inscritos en una materia (consulta del docente), paginado y con búsqueda. */
    @Query(value = """
            select i from Inscripcion i join fetch i.estudiante e join fetch i.materia m
            where m.id = :materiaId
              and (:estado is null or i.estado = :estado)
              and (:q is null or lower(e.nombre) like :q or lower(e.apellidos) like :q or lower(e.correo) like :q)
            """,
            countQuery = """
            select count(i) from Inscripcion i join i.estudiante e
            where i.materia.id = :materiaId
              and (:estado is null or i.estado = :estado)
              and (:q is null or lower(e.nombre) like :q or lower(e.apellidos) like :q or lower(e.correo) like :q)
            """)
    Page<Inscripcion> inscritos(@Param("materiaId") Long materiaId, @Param("estado") EstadoInscripcion estado,
                                @Param("q") String q, Pageable pageable);

    @Query("select i from Inscripcion i join fetch i.estudiante join fetch i.materia where i.id = :id")
    Optional<Inscripcion> buscarDetalle(@Param("id") Long id);

    Optional<Inscripcion> findByEstudianteIdAndMateriaId(Long estudianteId, Long materiaId);

    boolean existsByEstudianteIdAndMateriaIdAndEstado(Long estudianteId, Long materiaId, EstadoInscripcion estado);

    @Query("select i.estudiante from Inscripcion i where i.materia.id = :materiaId and i.estado = :estado")
    List<Usuario> estudiantesDe(@Param("materiaId") Long materiaId, @Param("estado") EstadoInscripcion estado);

    @Query("select i.materia.id from Inscripcion i where i.estudiante.id = :estudianteId and i.estado = :estado")
    List<Long> materiasDe(@Param("estudianteId") Long estudianteId, @Param("estado") EstadoInscripcion estado);

    /** [idMateria, total] para una página de materias: evita contar materia por materia. */
    @Query("""
            select i.materia.id, count(i) from Inscripcion i
            where i.materia.id in :ids and i.estado = :estado group by i.materia.id
            """)
    List<Object[]> contarPorMateria(@Param("ids") Collection<Long> ids, @Param("estado") EstadoInscripcion estado);

    long countByEstado(EstadoInscripcion estado);
}
