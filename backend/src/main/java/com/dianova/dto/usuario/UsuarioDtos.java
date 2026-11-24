package com.dianova.dto.usuario;

import com.dianova.domain.Enums.RolCodigo;
import com.dianova.domain.PreferenciaNotificacion;
import com.dianova.domain.Usuario;
import com.dianova.validation.ContrasenaSegura;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

import static com.dianova.dto.auth.AuthDtos.MSG_TELEFONO;
import static com.dianova.dto.auth.AuthDtos.REGEX_TELEFONO;

public final class UsuarioDtos {

    private UsuarioDtos() {
    }

    public record UsuarioDto(
            Long id, String nombre, String apellidos, String nombreCompleto, String correo,
            RolCodigo rol, String rolNombre, String telefono, String carrera, String avatarUrl,
            boolean activo, LocalDateTime ultimoAcceso, LocalDateTime creadoEn) {

        /** Requiere el rol cargado (JOIN FETCH u.rol) para no disparar consultas extra. */
        public static UsuarioDto de(Usuario u) {
            return new UsuarioDto(u.getId(), u.getNombre(), u.getApellidos(), u.getNombreCompleto(), u.getCorreo(),
                    u.getRol().getCodigo(), u.getRol().getNombre(), u.getTelefono(), u.getCarrera(), u.getAvatarUrl(),
                    u.isActivo(), u.getUltimoAcceso(), u.getCreadoEn());
        }
    }

    public record UsuarioCrearRequest(
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
            @NotNull(message = "Elige un rol")
            RolCodigo rol,
            @Pattern(regexp = REGEX_TELEFONO, message = MSG_TELEFONO)
            String telefono,
            @Size(max = 120, message = "La carrera no puede superar 120 caracteres")
            String carrera,
            Boolean activo) {
    }

    /** La contraseña es opcional: vacía significa "no cambiarla". */
    public record UsuarioActualizarRequest(
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
            @ContrasenaSegura
            String contrasena,
            @NotNull(message = "Elige un rol")
            RolCodigo rol,
            @Pattern(regexp = REGEX_TELEFONO, message = MSG_TELEFONO)
            String telefono,
            @Size(max = 120, message = "La carrera no puede superar 120 caracteres")
            String carrera,
            @NotNull(message = "Indica si la cuenta está activa")
            Boolean activo) {
    }

    public record EstadoUsuarioRequest(@NotNull(message = "Indica si la cuenta está activa") Boolean activo) {
    }

    public record PerfilRequest(
            @NotBlank(message = "El nombre es obligatorio")
            @Size(min = 2, max = 80, message = "El nombre debe tener entre 2 y 80 caracteres")
            String nombre,
            @NotBlank(message = "Los apellidos son obligatorios")
            @Size(min = 2, max = 120, message = "Los apellidos deben tener entre 2 y 120 caracteres")
            String apellidos,
            @Pattern(regexp = REGEX_TELEFONO, message = MSG_TELEFONO)
            String telefono,
            @Size(max = 120, message = "La carrera no puede superar 120 caracteres")
            String carrera,
            @Size(max = 500, message = "La URL no puede superar 500 caracteres")
            @Pattern(regexp = "^$|^https?://\\S+$", message = "Escribe una URL que empiece con http:// o https://")
            String avatarUrl) {
    }

    public record CambiarContrasenaRequest(
            @NotBlank(message = "Escribe tu contraseña actual")
            String actual,
            @NotBlank(message = "La nueva contraseña es obligatoria")
            @ContrasenaSegura
            String nueva) {
    }

    public record PreferenciasDto(boolean emailHabilitado, boolean smsHabilitado, boolean whatsappHabilitado,
                                  Integer minutosAnticipacion, LocalDateTime consentimientoEn) {
        public static PreferenciasDto de(PreferenciaNotificacion p) {
            return new PreferenciasDto(p.isEmailHabilitado(), p.isSmsHabilitado(), p.isWhatsappHabilitado(),
                    p.getMinutosAnticipacion(), p.getConsentimientoEn());
        }
    }

    public record PreferenciasRequest(
            @NotNull(message = "Indica si aceptas correos") Boolean emailHabilitado,
            @NotNull(message = "Indica si aceptas SMS") Boolean smsHabilitado,
            @NotNull(message = "Indica si aceptas WhatsApp") Boolean whatsappHabilitado,
            @NotNull(message = "Indica la anticipación")
            @Min(value = 5, message = "La anticipación mínima es de 5 minutos")
            @Max(value = 10080, message = "La anticipación máxima es de 7 días")
            Integer minutosAnticipacion) {
    }
}
