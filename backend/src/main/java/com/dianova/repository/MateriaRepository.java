package com.dianova.repository;

import com.dianova.domain.Enums.EstadoInscripcion;
import com.dianova.domain.Materia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface MateriaRepository extends JpaRepository<Materia, Long> {

    /**
     * Listado paginado. Periodo y docente se traen con JOIN FETCH (relaciones a uno: no rompen la paginación).
     * estudianteId / docenteId limitan el resultado a lo que ese usuario puede ver.
     */
    @Query(value = """
            select m from Materia m join fetch m.periodo p left join fetch m.docente d
            where (:q is null or lower(m.nombre) like :q or lower(m.codigoGrupo) like :q)
              and (:periodoId is null or p.id = :periodoId)
              and (:docenteId is null or d.id = :docenteId)
              and (:estudianteId is null or exists (
                    select 1 from Inscripcion i
                    where i.materia = m and i.estudiante.id = :estudianteId and i.estado = :activa))
            """,
            countQuery = """
            select count(m) from Materia m join m.periodo p left join m.docente d
            where (:q is null or lower(m.nombre) like :q or lower(m.codigoGrupo) like :q)
              and (:periodoId is null or p.id = :periodoId)
              and (:docenteId is null or d.id = :docenteId)
              and (:estudianteId is null or exists (
                    select 1 from Inscripcion i
                    where i.materia = m and i.estudiante.id = :estudianteId and i.estado = :activa))
            """)
    Page<Materia> buscar(@Param("q") String q, @Param("periodoId") Long periodoId, @Param("docenteId") Long docenteId,
                         @Param("estudianteId") Long estudianteId, @Param("activa") EstadoInscripcion activa,
                         Pageable pageable);

    @Query("select m from Materia m join fetch m.periodo left join fetch m.docente where m.id = :id")
    Optional<Materia> buscarDetalle(@Param("id") Long id);

    boolean existsByPeriodoIdAndCodigoGrupoIgnoreCase(Long periodoId, String codigoGrupo);

    boolean existsByPeriodoIdAndCodigoGrupoIgnoreCaseAndIdNot(Long periodoId, String codigoGrupo, Long id);

    long countByDocenteId(Long docenteId);

    boolean existsByPeriodoId(Long periodoId);
}
