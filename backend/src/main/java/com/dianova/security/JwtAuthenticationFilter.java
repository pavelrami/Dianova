package com.dianova.security;

import com.dianova.domain.SesionJwt;
import com.dianova.domain.Usuario;
import com.dianova.repository.SesionRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

/**
 * Lee "Authorization: Bearer &lt;jwt&gt;", valida la firma y comprueba en sesiones_jwt
 * que el token no haya sido revocado (logout) y que la cuenta siga activa.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final SesionRepository sesiones;

    public JwtAuthenticationFilter(JwtService jwtService, SesionRepository sesiones) {
        this.jwtService = jwtService;
        this.sesiones = sesiones;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith("Bearer ")
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            String token = header.substring(7).trim();
            jwtService.validar(token).flatMap(this::principalVigente).ifPresent(principal -> {
                var auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            });
        }
        chain.doFilter(request, response);
    }

    private Optional<UsuarioPrincipal> principalVigente(Claims claims) {
        if (claims.getId() == null) {
            return Optional.empty();
        }
        String jtiHash = Hashes.sha256(claims.getId());
        // El rol se toma de la BD (no del token): si el admin cambia el rol, aplica de inmediato.
        return sesiones.buscarConUsuario(jtiHash)
                .filter(SesionJwt::estaVigente)
                .map(SesionJwt::getUsuario)
                .filter(Usuario::isActivo)
                .filter(u -> String.valueOf(u.getId()).equals(claims.getSubject()))
                .map(u -> new UsuarioPrincipal(u.getId(), u.getCorreo(), u.getPasswordHash(),
                        u.getRol().getCodigo(), true, jtiHash));
    }
}
