package com.dianova.repository;

import com.dianova.domain.HorarioClase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface HorarioRepository extends JpaRepository<HorarioClase, Long> {

    List<HorarioClase> findByMateriaIdOrderByDiaSemanaAscHoraInicioAsc(Long materiaId);

    /** Horarios de varias materias en una sola consulta (para listados y agenda). */
    @Query("""
            select h from HorarioClase h join fetch h.materia m left join fetch m.docente
            where m.id in :ids order by h.diaSemana, h.horaInicio
            """)
    List<HorarioClase> deMaterias(@Param("ids") Collection<Long> ids);
}
