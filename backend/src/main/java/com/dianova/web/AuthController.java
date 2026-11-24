package com.dianova.web;

import com.dianova.dto.auth.AuthDtos.*;
import com.dianova.dto.comun.Mini.Mensaje;
import com.dianova.dto.usuario.UsuarioDtos.UsuarioDto;
import com.dianova.security.Actual;
import com.dianova.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    /** Público. Devuelve el JWT que se envía después en "Authorization: Bearer ...". */
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req, HttpServletRequest http) {
        return auth.login(req, http);
    }

    /** Público. Crea una cuenta de estudiante e inicia sesión. */
    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse registro(@Valid @RequestBody RegistroRequest req, HttpServletRequest http) {
        return auth.registro(req, http);
    }

    /** Invalida el token actual (queda revocado en sesiones_jwt). */
    @PostMapping("/logout")
    public Mensaje logout() {
        auth.logout(Actual.usuario());
        return new Mensaje("Sesión cerrada");
    }

    @GetMapping("/yo")
    public UsuarioDto yo() {
        return auth.yo(Actual.usuario());
    }

    /** Público. Envía un enlace de recuperación al correo si existe una cuenta activa. */
    @PostMapping("/recuperar")
    public Mensaje recuperar(@Valid @RequestBody RecuperarRequest req) {
        auth.solicitarRecuperacion(req);
        return new Mensaje("Si el correo está registrado, recibirás un enlace para restablecer tu contraseña en unos minutos");
    }

    /** Público. Cambia la contraseña con el token recibido por correo y cierra todas las sesiones. */
    @PostMapping("/restablecer")
    public Mensaje restablecer(@Valid @RequestBody RestablecerRequest req) {
        auth.restablecer(req);
        return new Mensaje("Tu contraseña se actualizó. Ya puedes iniciar sesión");
    }
}
