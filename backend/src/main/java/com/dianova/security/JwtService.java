package com.dianova.security;

import com.dianova.config.DianovaProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

/** Emite y valida JWT firmados con HS256. Cada token lleva un JTI único que se registra en sesiones_jwt. */
@Service
public class JwtService {

    private final SecretKey clave;
    private final long minutosExpiracion;
    private final String emisor;

    public JwtService(DianovaProperties props) {
        byte[] bytes = Decoders.BASE64.decode(props.jwt().secreto());
        if (bytes.length < 32) {
            throw new IllegalStateException("dianova.jwt.secreto debe tener al menos 32 bytes (256 bits) en Base64");
        }
        this.clave = Keys.hmacShaKeyFor(bytes);
        this.minutosExpiracion = props.jwt().minutosExpiracion();
        this.emisor = props.jwt().emisor();
    }

    public TokenEmitido emitir(Long usuarioId, String correo, String rol) {
        Instant ahora = Instant.now();
        Instant expira = ahora.plusSeconds(minutosExpiracion * 60);
        String jti = UUID.randomUUID().toString();
        String token = Jwts.builder()
                .id(jti)
                .issuer(emisor)
                .subject(String.valueOf(usuarioId))
                .claim("correo", correo)
                .claim("rol", rol)
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(expira))
                .signWith(clave)
                .compact();
        return new TokenEmitido(token, jti, ahora, expira);
    }

    /** Devuelve los claims si la firma, el emisor y la expiración son válidos. */
    public Optional<Claims> validar(String token) {
        try {
            return Optional.of(Jwts.parser()
                    .verifyWith(clave)
                    .requireIssuer(emisor)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload());
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    public record TokenEmitido(String token, String jti, Instant emitidoEn, Instant expiraEn) {
    }
}
