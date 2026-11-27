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

    /** Público. Paso 1 del registro: envía un código de 6 dígitos al correo. 429 si se pide antes de 60 s. */
    @PostMapping("/registro/codigo")
    public CodigoEnviado codigoRegistro(@Valid @RequestBody CodigoRegistroRequest req, HttpServletRequest http) {
        return auth.enviarCodigoRegistro(req, http);
    }

    /** Público. Paso 2 del registro: con el código del correo crea la cuenta de estudiante e inicia sesión. */
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

    /** Público. Paso 1: envía un código por correo (canal EMAIL) o SMS (canal SMS) si existe una cuenta activa. */
    @PostMapping("/recuperar")
    public Mensaje recuperar(@Valid @RequestBody RecuperarRequest req, HttpServletRequest http) {
        auth.solicitarRecuperacion(req, http);
        return new Mensaje("SMS".equals(req.canal())
                ? "Si la cuenta existe y tiene un teléfono registrado, recibirás un SMS con un código de 6 dígitos"
                : "Si el correo está registrado, recibirás un código de 6 dígitos en unos minutos");
    }

    /** Público. Paso 2: valida el código y devuelve un token temporal (15 min) para cambiar la contraseña. */
    @PostMapping("/recuperar/verificar")
    public TokenRestablecer verificar(@Valid @RequestBody VerificarCodigoRequest req) {
        return auth.verificarCodigoRecuperacion(req);
    }

    /** Público. Paso 3: cambia la contraseña con el token del paso 2 y cierra todas las sesiones. */
    @PostMapping("/restablecer")
    public Mensaje restablecer(@Valid @RequestBody RestablecerRequest req) {
        auth.restablecer(req);
        return new Mensaje("Tu contraseña se actualizó. Ya puedes iniciar sesión");
    }
}
