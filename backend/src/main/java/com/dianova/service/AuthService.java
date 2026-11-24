package com.dianova.service;

import com.dianova.config.DianovaProperties;
import com.dianova.domain.Enums.RolCodigo;
import com.dianova.domain.PreferenciaNotificacion;
import com.dianova.domain.SesionJwt;
import com.dianova.domain.TokenRecuperacion;
import com.dianova.domain.Usuario;
import com.dianova.dto.auth.AuthDtos.*;
import com.dianova.dto.usuario.UsuarioDtos.UsuarioDto;
import com.dianova.exception.RecursoNoEncontradoException;
import com.dianova.exception.ReglaNegocioException;
import com.dianova.notificacion.NotificacionService;
import com.dianova.repository.*;
import com.dianova.security.Hashes;
import com.dianova.security.JwtService;
import com.dianova.security.JwtService.TokenEmitido;
import com.dianova.security.UsuarioPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;

/** Login, registro, logout (revocación del token) y recuperación de contraseña. */
@Service
@Transactional
public class AuthService {

    private static final long MINUTOS_RECUPERACION = 30;

    private final AuthenticationManager authManager;
    private final UsuarioRepository usuarios;
    private final RolRepository roles;
    private final PreferenciaRepository preferencias;
    private final SesionRepository sesiones;
    private final TokenRecuperacionRepository tokens;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final NotificacionService notificaciones;
    private final DianovaProperties props;

    public AuthService(AuthenticationManager authManager, UsuarioRepository usuarios, RolRepository roles,
                       PreferenciaRepository preferencias, SesionRepository sesiones, TokenRecuperacionRepository tokens,
                       PasswordEncoder encoder, JwtService jwt, NotificacionService notificaciones, DianovaProperties props) {
        this.authManager = authManager;
        this.usuarios = usuarios;
        this.roles = roles;
        this.preferencias = preferencias;
        this.sesiones = sesiones;
        this.tokens = tokens;
        this.encoder = encoder;
        this.jwt = jwt;
        this.notificaciones = notificaciones;
        this.props = props;
    }

    /** Lanza BadCredentialsException (401) o DisabledException (401) si no procede. */
    public AuthResponse login(LoginRequest req, HttpServletRequest http) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.correo().trim(), req.contrasena()));
        Usuario u = usuarios.buscarPorCorreo(req.correo().trim()).orElseThrow();
        u.setUltimoAcceso(LocalDateTime.now());
        return emitirSesion(u, http);
    }

    /** Autoregistro: siempre crea una cuenta de ESTUDIANTE. Docentes y administradores los crea el admin. */
    public AuthResponse registro(RegistroRequest req, HttpServletRequest http) {
        String correo = req.correo().trim().toLowerCase();
        if (usuarios.existsByCorreoIgnoreCase(correo)) {
            throw ReglaNegocioException.campo("correo", "Ya existe una cuenta con este correo");
        }
        Usuario u = new Usuario();
        u.setRol(roles.findByCodigo(RolCodigo.ESTUDIANTE).orElseThrow());
        u.setNombre(req.nombre().trim());
        u.setApellidos(req.apellidos().trim());
        u.setCorreo(correo);
        u.setPasswordHash(encoder.encode(req.contrasena()));
        u.setTelefono(Consultas.limpiar(req.telefono()));
        u.setCarrera(Consultas.limpiar(req.carrera()));
        u.setUltimoAcceso(LocalDateTime.now());
        usuarios.save(u);
        PreferenciaNotificacion pref = new PreferenciaNotificacion(u);
        pref.setConsentimientoEn(LocalDateTime.now());
        preferencias.save(pref);
        notificaciones.bienvenida(u.getCorreo(), u.getNombre());
        return emitirSesion(u, http);
    }

    /** Logout real: el JTI del token queda revocado y el filtro lo rechaza aunque no haya expirado. */
    public void logout(UsuarioPrincipal actual) {
        if (actual.getJtiHash() == null) return;
        sesiones.findByJtiHash(actual.getJtiHash()).ifPresent(s -> s.setRevocadaEn(LocalDateTime.now()));
    }

    @Transactional(readOnly = true)
    public UsuarioDto yo(UsuarioPrincipal actual) {
        return usuarios.buscarConRol(actual.getId()).map(UsuarioDto::de)
                .orElseThrow(() -> RecursoNoEncontradoException.de("Usuario", actual.getId()));
    }

    /** Siempre responde lo mismo para no revelar qué correos existen. */
    public void solicitarRecuperacion(RecuperarRequest req) {
        usuarios.buscarPorCorreo(req.correo().trim()).filter(Usuario::isActivo).ifPresent(u -> {
            LocalDateTime ahora = LocalDateTime.now();
            tokens.invalidarAnteriores(u.getId(), ahora);
            String token = Hashes.tokenAleatorio();
            TokenRecuperacion t = new TokenRecuperacion();
            t.setUsuario(u);
            t.setTokenHash(Hashes.sha256(token));
            t.setExpiraEn(ahora.plusMinutes(MINUTOS_RECUPERACION));
            tokens.save(t);
            String enlace = props.frontendUrl() + "/restablecer?token=" + token;
            notificaciones.recuperacion(u.getCorreo(), u.getNombre(), enlace, MINUTOS_RECUPERACION);
        });
    }

    public void restablecer(RestablecerRequest req) {
        TokenRecuperacion t = tokens.buscarPorHash(Hashes.sha256(req.token().trim()))
                .filter(TokenRecuperacion::esValido)
                .orElseThrow(() -> ReglaNegocioException.campo("token", "El enlace no es válido o ya expiró. Solicita uno nuevo"));
        Usuario u = t.getUsuario();
        u.setPasswordHash(encoder.encode(req.contrasena()));
        LocalDateTime ahora = LocalDateTime.now();
        t.setUsadoEn(ahora);
        sesiones.revocarTodas(u.getId(), ahora);
        notificaciones.contrasenaCambiada(u.getCorreo(), u.getNombre());
    }

    private AuthResponse emitirSesion(Usuario u, HttpServletRequest http) {
        TokenEmitido t = jwt.emitir(u.getId(), u.getCorreo(), u.getRol().getCodigo().name());
        ZoneId zona = ZoneId.systemDefault();
        SesionJwt s = new SesionJwt();
        s.setUsuario(u);
        s.setJtiHash(Hashes.sha256(t.jti()));
        s.setEmitidaEn(LocalDateTime.ofInstant(t.emitidoEn(), zona));
        s.setExpiraEn(LocalDateTime.ofInstant(t.expiraEn(), zona));
        if (http != null) {
            String ip = http.getHeader("X-Forwarded-For");
            s.setIp(recortar(ip != null ? ip.split(",")[0].trim() : http.getRemoteAddr(), 45));
            s.setUserAgent(recortar(http.getHeader("User-Agent"), 255));
        }
        sesiones.save(s);
        return new AuthResponse(t.token(), "Bearer", s.getExpiraEn(), UsuarioDto.de(u));
    }

    private static String recortar(String s, int max) {
        return s == null ? null : s.substring(0, Math.min(s.length(), max));
    }
}
