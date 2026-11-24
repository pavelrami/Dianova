package com.dianova.repository;

import com.dianova.domain.Enums.RespuestaParticipacion;
import com.dianova.domain.ParticipacionEvento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ParticipacionRepository extends JpaRepository<ParticipacionEvento, Long> {

    Optional<ParticipacionEvento> findByEventoIdAndUsuarioId(Long eventoId, Long usuarioId);

    boolean existsByEventoIdAndUsuarioId(Long eventoId, Long usuarioId);

    @Query(value = """
            select p from ParticipacionEvento p join fetch p.usuario u
            where p.evento.id = :eventoId and (:respuesta is null or p.respuesta = :respuesta)
            """,
            countQuery = """
            select count(p) from ParticipacionEvento p
            where p.evento.id = :eventoId and (:respuesta is null or p.respuesta = :respuesta)
            """)
    Page<ParticipacionEvento> deEvento(@Param("eventoId") Long eventoId,
                                       @Param("respuesta") RespuestaParticipacion respuesta, Pageable pageable);

    @Query("select p from ParticipacionEvento p join fetch p.usuario join fetch p.evento where p.id = :id")
    Optional<ParticipacionEvento> buscarDetalle(@Param("id") Long id);

    /** [idEvento, total, confirmados] para una página de eventos. */
    @Query("""
            select p.evento.id, count(p), sum(case when p.respuesta = :confirmada then 1 else 0 end)
            from ParticipacionEvento p where p.evento.id in :ids group by p.evento.id
            """)
    List<Object[]> conteoPorEvento(@Param("ids") Collection<Long> ids,
                                   @Param("confirmada") RespuestaParticipacion confirmada);

    /** [idEvento, respuesta] del usuario en varios eventos. */
    @Query("select p.evento.id, p.respuesta from ParticipacionEvento p where p.usuario.id = :uid and p.evento.id in :ids")
    List<Object[]> respuestasDe(@Param("uid") Long usuarioId, @Param("ids") Collection<Long> ids);
}
