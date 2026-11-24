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
            String carrera) {
    }

    public record AuthResponse(String token, String tipo, LocalDateTime expiraEn, UsuarioDto usuario) {
    }

    public record RecuperarRequest(
            @NotBlank(message = "El correo es obligatorio")
            @Email(message = "Escribe un correo válido")
            String correo) {
    }

    public record RestablecerRequest(
            @NotBlank(message = "El enlace de recuperación no es válido")
            String token,
            @NotBlank(message = "La contraseña es obligatoria")
            @ContrasenaSegura
            String contrasena) {
    }
}
