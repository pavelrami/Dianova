package com.dianova.service;

import com.dianova.domain.Enums.CanalNotificacion;
import com.dianova.domain.Enums.RolCodigo;
import com.dianova.domain.PreferenciaNotificacion;
import com.dianova.domain.SesionJwt;
import com.dianova.domain.TokenRecuperacion;
import com.dianova.domain.Usuario;
import com.dianova.dto.auth.AuthDtos.*;
import com.dianova.dto.usuario.UsuarioDtos.UsuarioDto;
import com.dianova.exception.RecursoNoEncontradoException;
import com.dianova.exception.ReglaNegocioException;
import com.dianova.exception.ServicioNoDisponibleException;
import com.dianova.notificacion.EnvioException;
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

/**
 * Login, registro con código al correo, logout (revocación del token) y recuperación de contraseña
 * con código por correo o SMS.
 */
@Service
@Transactional
public class AuthService {

    /** Tiempo para escribir la nueva contraseña después de validar el código. */
    private static final long MINUTOS_RESTABLECER = 15;

    private final AuthenticationManager authManager;
    private final UsuarioRepository usuarios;
    private final RolRepository roles;
    private final PreferenciaRepository preferencias;
    private final SesionRepository sesiones;
    private final TokenRecuperacionRepository tokens;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final NotificacionService notificaciones;
    private final CodigoVerificacionService codigos;

    public AuthService(AuthenticationManager authManager, UsuarioRepository usuarios, RolRepository roles,
                       PreferenciaRepository preferencias, SesionRepository sesiones, TokenRecuperacionRepository tokens,
                       PasswordEncoder encoder, JwtService jwt, NotificacionService notificaciones,
                       CodigoVerificacionService codigos) {
        this.authManager = authManager;
        this.usuarios = usuarios;
        this.roles = roles;
        this.preferencias = preferencias;
        this.sesiones = sesiones;
        this.tokens = tokens;
        this.encoder = encoder;
        this.jwt = jwt;
        this.notificaciones = notificaciones;
        this.codigos = codigos;
    }

    /** Lanza BadCredentialsException (401) o DisabledException (401) si no procede. */
    public AuthResponse login(LoginRequest req, HttpServletRequest http) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.correo().trim(), req.contrasena()));
        Usuario u = usuarios.buscarPorCorreo(req.correo().trim()).orElseThrow();
        u.setUltimoAcceso(LocalDateTime.now());
        return emitirSesion(u, http);
    }

    /** Registro, paso 1: manda un código de 6 dígitos al correo. La cuenta todavía no se crea. */
    public CodigoEnviado enviarCodigoRegistro(CodigoRegistroRequest req, HttpServletRequest http) {
        String correo = req.correo().trim().toLowerCase();
        exigirCorreoLibre(correo);
        String codigo = codigos.emitirRegistro(correo, ipDe(http));
        try {
            notificaciones.codigoRegistro(correo, codigo, CodigoVerificacionService.MINUTOS_VIGENCIA);
        } catch (EnvioException e) {
            throw new ServicioNoDisponibleException("No pudimos enviar el código a tu correo en este momento. Intenta más tarde");
        }
        return new CodigoEnviado("Te enviamos un código de 6 dígitos a " + correo,
                CodigoVerificacionService.MINUTOS_VIGENCIA, CodigoVerificacionService.SEGUNDOS_ENTRE_ENVIOS);
    }

    /**
     * Registro, paso 2: con el código correcto crea una cuenta de ESTUDIANTE con el correo ya verificado.
     * Docentes y administradores los crea el admin.
     */
    @Transactional(noRollbackFor = ReglaNegocioException.class)
    public AuthResponse registro(RegistroRequest req, HttpServletRequest http) {
        String correo = req.correo().trim().toLowerCase();
        exigirCorreoLibre(correo);
        codigos.validarRegistro(correo, req.codigo());
        Usuario u = new Usuario();
        u.setRol(roles.findByCodigo(RolCodigo.ESTUDIANTE).orElseThrow());
        u.setNombre(req.nombre().trim());
        u.setApellidos(req.apellidos().trim());
        u.setCorreo(correo);
        u.setCorreoVerificadoEn(LocalDateTime.now());
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

    /**
     * Recuperación, paso 1: manda un código por correo o por SMS (al teléfono registrado).
     * Siempre responde lo mismo para no revelar qué correos existen.
     */
    public void solicitarRecuperacion(RecuperarRequest req, HttpServletRequest http) {
        CanalNotificacion canal = "SMS".equals(req.canal()) ? CanalNotificacion.SMS : CanalNotificacion.EMAIL;
        usuarios.buscarPorCorreo(req.correo().trim()).filter(Usuario::isActivo).ifPresent(u -> {
            String destino = canal == CanalNotificacion.SMS ? Consultas.limpiar(u.getTelefono()) : u.getCorreo();
            if (destino == null) return; // pidió SMS pero no tiene teléfono registrado
            codigos.emitirRecuperacion(u, canal, destino, ipDe(http)).ifPresent(codigo ->
                    notificaciones.codigoRecuperacion(canal, destino, u.getNombre(), codigo, CodigoVerificacionService.MINUTOS_VIGENCIA));
        });
    }

    /** Recuperación, paso 2: con el código correcto entrega un token de un solo uso para cambiar la contraseña. */
    @Transactional(noRollbackFor = ReglaNegocioException.class)
    public TokenRestablecer verificarCodigoRecuperacion(VerificarCodigoRequest req) {
        Usuario u = usuarios.buscarPorCorreo(req.correo().trim()).filter(Usuario::isActivo)
                .orElseThrow(() -> CodigoVerificacionService.codigoInvalido(null));
        codigos.validarRecuperacion(u, req.codigo());
        LocalDateTime ahora = LocalDateTime.now();
        tokens.invalidarAnteriores(u.getId(), ahora);
        String token = Hashes.tokenAleatorio();
        TokenRecuperacion t = new TokenRecuperacion();
        t.setUsuario(u);
        t.setTokenHash(Hashes.sha256(token));
        t.setExpiraEn(ahora.plusMinutes(MINUTOS_RESTABLECER));
        tokens.save(t);
        return new TokenRestablecer(token, t.getExpiraEn());
    }

    /** Recuperación, paso 3: nueva contraseña. Cierra todas las sesiones abiertas. */
    public void restablecer(RestablecerRequest req) {
        TokenRecuperacion t = tokens.buscarPorHash(Hashes.sha256(req.token().trim()))
                .filter(TokenRecuperacion::esValido)
                .orElseThrow(() -> ReglaNegocioException.campo("token", "La verificación expiró. Solicita un código nuevo"));
        Usuario u = t.getUsuario();
        u.setPasswordHash(encoder.encode(req.contrasena()));
        LocalDateTime ahora = LocalDateTime.now();
        t.setUsadoEn(ahora);
        sesiones.revocarTodas(u.getId(), ahora);
        notificaciones.contrasenaCambiada(u.getCorreo(), u.getNombre());
    }

    private void exigirCorreoLibre(String correo) {
        if (usuarios.existsByCorreoIgnoreCase(correo)) {
            throw ReglaNegocioException.campo("correo", "Ya existe una cuenta con este correo");
        }
    }

    private static String ipDe(HttpServletRequest http) {
        if (http == null) return null;
        String ip = http.getHeader("X-Forwarded-For");
        return recortar(ip != null ? ip.split(",")[0].trim() : http.getRemoteAddr(), 45);
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
            s.setIp(ipDe(http));
            s.setUserAgent(recortar(http.getHeader("User-Agent"), 255));
        }
        sesiones.save(s);
        return new AuthResponse(t.token(), "Bearer", s.getExpiraEn(), UsuarioDto.de(u));
    }

    private static String recortar(String s, int max) {
        return s == null ? null : s.substring(0, Math.min(s.length(), max));
    }
}
