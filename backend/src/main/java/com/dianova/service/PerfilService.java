package com.dianova.service;

import com.dianova.domain.PreferenciaNotificacion;
import com.dianova.domain.Usuario;
import com.dianova.dto.usuario.UsuarioDtos.*;
import com.dianova.exception.RecursoNoEncontradoException;
import com.dianova.exception.ReglaNegocioException;
import com.dianova.notificacion.NotificacionService;
import com.dianova.repository.PreferenciaRepository;
import com.dianova.repository.SesionRepository;
import com.dianova.repository.UsuarioRepository;
import com.dianova.security.UsuarioPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/** Datos propios del usuario autenticado: perfil, contraseña y preferencias de notificación. */
@Service
@Transactional
public class PerfilService {

    private final UsuarioRepository usuarios;
    private final PreferenciaRepository preferencias;
    private final SesionRepository sesiones;
    private final PasswordEncoder encoder;
    private final NotificacionService notificaciones;

    public PerfilService(UsuarioRepository usuarios, PreferenciaRepository preferencias, SesionRepository sesiones,
                         PasswordEncoder encoder, NotificacionService notificaciones) {
        this.usuarios = usuarios;
        this.preferencias = preferencias;
        this.sesiones = sesiones;
        this.encoder = encoder;
        this.notificaciones = notificaciones;
    }

    public UsuarioDto actualizar(UsuarioPrincipal actual, PerfilRequest req) {
        Usuario u = cargar(actual);
        u.setNombre(req.nombre().trim());
        u.setApellidos(req.apellidos().trim());
        u.setTelefono(Consultas.limpiar(req.telefono()));
        u.setCarrera(Consultas.limpiar(req.carrera()));
        u.setAvatarUrl(Consultas.limpiar(req.avatarUrl()));
        // Sin teléfono no puede recibir SMS ni WhatsApp
        if (u.getTelefono() == null) {
            preferencias.findById(u.getId()).ifPresent(p -> {
                p.setSmsHabilitado(false);
                p.setWhatsappHabilitado(false);
            });
        }
        return UsuarioDto.de(u);
    }

    /** Cambia la contraseña y cierra las demás sesiones abiertas (la actual sigue válida). */
    public void cambiarContrasena(UsuarioPrincipal actual, CambiarContrasenaRequest req) {
        Usuario u = cargar(actual);
        if (!encoder.matches(req.actual(), u.getPasswordHash())) {
            throw ReglaNegocioException.campo("actual", "La contraseña actual no es correcta");
        }
        if (encoder.matches(req.nueva(), u.getPasswordHash())) {
            throw ReglaNegocioException.campo("nueva", "La nueva contraseña debe ser distinta a la actual");
        }
        u.setPasswordHash(encoder.encode(req.nueva()));
        LocalDateTime ahora = LocalDateTime.now();
        sesiones.revocarTodas(u.getId(), ahora);
        if (actual.getJtiHash() != null) {
            sesiones.findByJtiHash(actual.getJtiHash()).ifPresent(s -> s.setRevocadaEn(null));
        }
        notificaciones.contrasenaCambiada(u.getCorreo(), u.getNombre());
    }

    public PreferenciasDto preferencias(UsuarioPrincipal actual) {
        return PreferenciasDto.de(obtenerOCrear(cargar(actual)));
    }

    public PreferenciasDto actualizarPreferencias(UsuarioPrincipal actual, PreferenciasRequest req) {
        Usuario u = cargar(actual);
        boolean sinTelefono = u.getTelefono() == null || u.getTelefono().isBlank();
        if (sinTelefono && Boolean.TRUE.equals(req.smsHabilitado())) {
            throw ReglaNegocioException.campo("smsHabilitado", "Agrega tu teléfono en el perfil para recibir SMS");
        }
        if (sinTelefono && Boolean.TRUE.equals(req.whatsappHabilitado())) {
            throw ReglaNegocioException.campo("whatsappHabilitado", "Agrega tu teléfono en el perfil para recibir WhatsApp");
        }
        PreferenciaNotificacion p = obtenerOCrear(u);
        p.setEmailHabilitado(req.emailHabilitado());
        p.setSmsHabilitado(req.smsHabilitado());
        p.setWhatsappHabilitado(req.whatsappHabilitado());
        p.setMinutosAnticipacion(req.minutosAnticipacion());
        p.setConsentimientoEn(LocalDateTime.now());
        return PreferenciasDto.de(p);
    }

    private PreferenciaNotificacion obtenerOCrear(Usuario u) {
        return preferencias.findById(u.getId()).orElseGet(() -> preferencias.save(new PreferenciaNotificacion(u)));
    }

    private Usuario cargar(UsuarioPrincipal actual) {
        return usuarios.buscarConRol(actual.getId())
                .orElseThrow(() -> RecursoNoEncontradoException.de("Usuario", actual.getId()));
    }
}
