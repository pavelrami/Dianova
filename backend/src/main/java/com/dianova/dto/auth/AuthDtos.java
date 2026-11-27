package com.dianova.dto.auth;

import com.dianova.dto.usuario.UsuarioDtos.UsuarioDto;
import com.dianova.validation.ContrasenaSegura;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public final class AuthDtos {

    private AuthDtos() {
    }

    public static final String REGEX_TELEFONO = "^$|^\\+[1-9]\\d{7,14}$";
    public static final String MSG_TELEFONO = "Usa formato internacional, por ejemplo +5215512345678";
    public static final String REGEX_CODIGO = "^[0-9]{6}$";
    public static final String MSG_CODIGO = "El código tiene 6 dígitos";

    public record LoginRequest(
            @NotBlank(message = "El correo es obligatorio")
            @Email(message = "Escribe un correo válido")
            String correo,
            @NotBlank(message = "La contraseña es obligatoria")
            String contrasena) {
    }

    public record RegistroRequest(
            @NotBlank(message = "El nombre es obligatorio")
            @Size(min = 2, max = 80, message = "El nombre debe tener entre 2 y 80 caracteres")
            String nombre,
            @NotBlank(message = "Los apellidos son obligatorios")
            @Size(min = 2, max = 120, message = "Los apellidos deben tener entre 2 y 120 caracteres")
            String apellidos,
            @NotBlank(message = "El correo es obligatorio")
            @Email(message = "Escribe un correo válido")
            @Size(max = 160, message = "El correo no puede superar 160 caracteres")
            String correo,
            @NotBlank(message = "La contraseña es obligatoria")
            @ContrasenaSegura
            String contrasena,
            @Pattern(regexp = REGEX_TELEFONO, message = MSG_TELEFONO)
            String telefono,
            @Size(max = 120, message = "La carrera no puede superar 120 caracteres")
            String carrera,
            /* Código de 6 dígitos que llegó al correo (POST /api/auth/registro/codigo) */
            @NotBlank(message = "Escribe el código que te enviamos al correo")
            @Pattern(regexp = REGEX_CODIGO, message = MSG_CODIGO)
            String codigo) {
    }

    /** Paso 1 del registro: envía un código al correo para confirmar que es tuyo. */
    public record CodigoRegistroRequest(
            @NotBlank(message = "El correo es obligatorio")
            @Email(message = "Escribe un correo válido")
            @Size(max = 160, message = "El correo no puede superar 160 caracteres")
            String correo) {
    }

    /** Respuesta al enviar un código: cuánto dura y cuánto esperar para pedir otro. */
    public record CodigoEnviado(String mensaje, long minutosVigencia, long segundosReenvio) {
    }

    public record AuthResponse(String token, String tipo, LocalDateTime expiraEn, UsuarioDto usuario) {
    }

    /** Paso 1 de la recuperación: canal EMAIL (por defecto) o SMS al teléfono registrado. */
    public record RecuperarRequest(
            @NotBlank(message = "El correo es obligatorio")
            @Email(message = "Escribe un correo válido")
            String correo,
            @Pattern(regexp = "^(EMAIL|SMS)?$", message = "Elige correo (EMAIL) o SMS")
            String canal) {
    }

    /** Paso 2 de la recuperación: valida el código y devuelve un token temporal para el paso 3. */
    public record VerificarCodigoRequest(
            @NotBlank(message = "El correo es obligatorio")
            @Email(message = "Escribe un correo válido")
            String correo,
            @NotBlank(message = "Escribe el código que recibiste")
            @Pattern(regexp = REGEX_CODIGO, message = MSG_CODIGO)
            String codigo) {
    }

    public record TokenRestablecer(String token, LocalDateTime expiraEn) {
    }

    /** Paso 3 de la recuperación: nueva contraseña con el token del paso 2. */
    public record RestablecerRequest(
            @NotBlank(message = "La verificación expiró. Solicita un código nuevo")
            String token,
            @NotBlank(message = "La contraseña es obligatoria")
            @ContrasenaSegura
            String contrasena) {
    }
}
