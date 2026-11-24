package com.dianova.repository;

import com.dianova.domain.SesionJwt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface SesionRepository extends JpaRepository<SesionJwt, Long> {

    Optional<SesionJwt> findByJtiHash(String jtiHash);

    /** Sesión con su usuario y rol en una sola consulta (la usa el filtro JWT en cada petición). */
    @Query("select s from SesionJwt s join fetch s.usuario u join fetch u.rol where s.jtiHash = :jtiHash")
    Optional<SesionJwt> buscarConUsuario(@Param("jtiHash") String jtiHash);

    /** Revoca todas las sesiones abiertas (al cambiar o restablecer la contraseña, o al desactivar la cuenta). */
    @Modifying
    @Query("update SesionJwt s set s.revocadaEn = :ahora where s.usuario.id = :usuarioId and s.revocadaEn is null")
    int revocarTodas(@Param("usuarioId") Long usuarioId, @Param("ahora") LocalDateTime ahora);

    @Modifying
    @Query("delete from SesionJwt s where s.expiraEn < :limite")
    int borrarExpiradas(@Param("limite") LocalDateTime limite);
}
