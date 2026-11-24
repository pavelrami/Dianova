package com.dianova.repository;

import com.dianova.domain.Enums.EstadoEvento;
import com.dianova.domain.Enums.EstadoInscripcion;
import com.dianova.domain.Enums.TipoEvento;
import com.dianova.domain.Evento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EventoRepository extends JpaRepository<Evento, Long> {

    /** Regla de visibilidad: creador, docente de la materia, inscrito activo en la materia o invitado al evento. */
    String VISIBLE = """
            (:todos = true or e.creador.id = :uid or m.docente.id = :uid
              or m.id in (select i.materia.id from Inscripcion i where i.estudiante.id = :uid and i.estado = :activa)
              or exists (select 1 from ParticipacionEvento p where p.evento = e and p.usuario.id = :uid))
            """;

    String FILTROS = """
              and (:q is null or lower(e.titulo) like :q or lower(e.ubicacion) like :q)
              and (:tipo is null or e.tipo = :tipo)
              and (:materiaId is null or m.id = :materiaId)
              and (:estado is null or e.estado = :estado)
              and (:desde is null or e.fin >= :desde)
              and (:hasta is null or e.inicio < :hasta)
            """;

    @Query(value = "select e from Evento e join fetch e.creador left join fetch e.materia m where " + VISIBLE + FILTROS,
            countQuery = "select count(e) from Evento e left join e.materia m where " + VISIBLE + FILTROS)
    Page<Evento> visibles(@Param("uid") Long usuarioId, @Param("todos") boolean todos,
                          @Param("activa") EstadoInscripcion activa, @Param("q") String q,
                          @Param("tipo") TipoEvento tipo, @Param("materiaId") Long materiaId,
                          @Param("estado") EstadoEvento estado, @Param("desde") LocalDateTime desde,
                          @Param("hasta") LocalDateTime hasta, Pageable pageable);

    /** Calendario: eventos visibles en un rango acotado (máximo ~2 meses, lo valida el servicio). */
    @Query("select e from Evento e join fetch e.creador left join fetch e.materia m where " + VISIBLE + FILTROS
            + " order by e.inicio")
    List<Evento> visiblesEnRango(@Param("uid") Long usuarioId, @Param("todos") boolean todos,
                                 @Param("activa") EstadoInscripcion activa, @Param("q") String q,
                                 @Param("tipo") TipoEvento tipo, @Param("materiaId") Long materiaId,
                                 @Param("estado") EstadoEvento estado, @Param("desde") LocalDateTime desde,
                                 @Param("hasta") LocalDateTime hasta);

    @Query("""
            select e from Evento e join fetch e.creador c join fetch c.rol
            left join fetch e.materia m left join fetch m.docente
            where e.id = :id
            """)
    Optional<Evento> buscarDetalle(@Param("id") Long id);

    long countByInicioGreaterThanEqual(LocalDateTime desde);
}
