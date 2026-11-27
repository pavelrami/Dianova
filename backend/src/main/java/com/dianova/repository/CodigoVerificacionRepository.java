package com.dianova.repository;

import com.dianova.domain.CodigoVerificacion;
import com.dianova.domain.Enums.PropositoCodigo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface CodigoVerificacionRepository extends JpaRepository<CodigoVerificacion, Long> {

    /** Último código de registro enviado a un correo. */
    Optional<CodigoVerificacion> findFirstByPropositoAndDestinoAndUsuarioIsNullOrderByCreadoEnDesc(
            PropositoCodigo proposito, String destino);

    /** Último código de recuperación de un usuario (por cualquier canal). */
    Optional<CodigoVerificacion> findFirstByPropositoAndUsuarioIdOrderByCreadoEnDesc(PropositoCodigo proposito, Long usuarioId);

    @Query("select count(c) from CodigoVerificacion c where c.proposito = :p and c.destino = :destino and c.creadoEn > :desde")
    long contarPorDestino(@Param("p") PropositoCodigo proposito, @Param("destino") String destino, @Param("desde") LocalDateTime desde);

    @Query("select count(c) from CodigoVerificacion c where c.proposito = :p and c.usuario.id = :usuarioId and c.creadoEn > :desde")
    long contarPorUsuario(@Param("p") PropositoCodigo proposito, @Param("usuarioId") Long usuarioId, @Param("desde") LocalDateTime desde);

    /** Al pedir un código nuevo, los anteriores dejan de servir. */
    @Modifying
    @Query("update CodigoVerificacion c set c.usadoEn = :ahora where c.proposito = :p and c.destino = :destino and c.usuario is null and c.usadoEn is null")
    int invalidarPorDestino(@Param("p") PropositoCodigo proposito, @Param("destino") String destino, @Param("ahora") LocalDateTime ahora);

    @Modifying
    @Query("update CodigoVerificacion c set c.usadoEn = :ahora where c.proposito = :p and c.usuario.id = :usuarioId and c.usadoEn is null")
    int invalidarPorUsuario(@Param("p") PropositoCodigo proposito, @Param("usuarioId") Long usuarioId, @Param("ahora") LocalDateTime ahora);

    /** Limpieza: códigos vencidos hace más de un día. */
    @Modifying
    @Query("delete from CodigoVerificacion c where c.expiraEn < :limite")
    int borrarVencidos(@Param("limite") LocalDateTime limite);
}
