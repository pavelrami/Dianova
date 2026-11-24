package com.dianova.repository;

import com.dianova.domain.TokenRecuperacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface TokenRecuperacionRepository extends JpaRepository<TokenRecuperacion, Long> {

    @Query("select t from TokenRecuperacion t join fetch t.usuario where t.tokenHash = :hash")
    Optional<TokenRecuperacion> buscarPorHash(@Param("hash") String hash);

    /** Al pedir un enlace nuevo, los anteriores dejan de servir. */
    @Modifying
    @Query("update TokenRecuperacion t set t.usadoEn = :ahora where t.usuario.id = :usuarioId and t.usadoEn is null")
    int invalidarAnteriores(@Param("usuarioId") Long usuarioId, @Param("ahora") LocalDateTime ahora);
}
