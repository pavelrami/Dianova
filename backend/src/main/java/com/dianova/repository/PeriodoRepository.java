package com.dianova.repository;

import com.dianova.domain.PeriodoAcademico;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PeriodoRepository extends JpaRepository<PeriodoAcademico, Long> {

    @Query("""
            select p from PeriodoAcademico p
            where (:q is null or lower(p.nombre) like :q) and (:activo is null or p.activo = :activo)
            """)
    Page<PeriodoAcademico> buscar(@Param("q") String q, @Param("activo") Boolean activo, Pageable pageable);

    Optional<PeriodoAcademico> findFirstByActivoTrueOrderByFechaInicioDesc();

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);
}
