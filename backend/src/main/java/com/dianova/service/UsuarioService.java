package com.dianova.service;

import com.dianova.domain.Enums.RolCodigo;
import com.dianova.domain.PreferenciaNotificacion;
import com.dianova.domain.Usuario;
import com.dianova.dto.comun.PaginaDto;
import com.dianova.dto.usuario.UsuarioDtos.*;
import com.dianova.exception.RecursoNoEncontradoException;
import com.dianova.exception.ReglaNegocioException;
import com.dianova.repository.*;
import com.dianova.security.UsuarioPrincipal;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

/** Gestión de usuarios y roles (solo administrador). */
@Service
@Transactional
public class UsuarioService {

    private static final Map<String, String> ORDEN = Map.of(
            "nombre", "nombre", "correo", "correo", "creado", "creadoEn", "acceso", "ultimoAcceso");

    private final UsuarioRepository usuarios;
    private final RolRepository roles;
    private final PreferenciaRepository preferencias;
    private final SesionRepository sesiones;
    private final RecordatorioRepository recordatorios;
    private final PasswordEncoder encoder;

    public UsuarioService(UsuarioRepository usuarios, RolRepository roles, PreferenciaRepository preferencias,
                          SesionRepository sesiones, RecordatorioRepository recordatorios, PasswordEncoder encoder) {
        this.usuarios = usuarios;
        this.roles = roles;
        this.preferencias = preferencias;
        this.sesiones = sesiones;
        this.recordatorios = recordatorios;
        this.encoder = encoder;
    }

    @Transactional(readOnly = true)
    public PaginaDto<UsuarioDto> listar(String q, RolCodigo rol, Boolean activo, int page, int size, String orden, String dir) {
        Sort sort = Sort.by(Consultas.direccion(dir), ORDEN.getOrDefault(orden, "nombre"));
        return PaginaDto.de(usuarios.buscar(Consultas.like(q), rol, activo, Consultas.pagina(page, size, sort)), UsuarioDto::de);
    }

    @Transactional(readOnly = true)
    public UsuarioDto obtener(Long id) {
        return UsuarioDto.de(cargar(id));
    }

    public UsuarioDto crear(UsuarioCrearRequest req) {
        String correo = req.correo().trim().toLowerCase();
        if (usuarios.existsByCorreoIgnoreCase(correo)) {
            throw ReglaNegocioException.campo("correo", "Ya existe una cuenta con este correo");
        }
        Usuario u = new Usuario();
        u.setRol(roles.findByCodigo(req.rol()).orElseThrow());
        u.setNombre(req.nombre().trim());
        u.setApellidos(req.apellidos().trim());
        u.setCorreo(correo);
        u.setPasswordHash(encoder.encode(req.contrasena()));
        u.setTelefono(Consultas.limpiar(req.telefono()));
        u.setCarrera(Consultas.limpiar(req.carrera()));
        u.setActivo(req.activo() == null || req.activo());
        usuarios.save(u);
        preferencias.save(new PreferenciaNotificacion(u));
        return UsuarioDto.de(u);
    }

    public UsuarioDto actualizar(UsuarioPrincipal actual, Long id, UsuarioActualizarRequest req) {
        Usuario u = cargar(id);
        String correo = req.correo().trim().toLowerCase();
        if (usuarios.existsByCorreoIgnoreCaseAndIdNot(correo, id)) {
            throw ReglaNegocioException.campo("correo", "Ya existe otra cuenta con este correo");
        }
        if (actual.getId().equals(id) && req.rol() != RolCodigo.ADMIN) {
            throw ReglaNegocioException.campo("rol", "No puedes quitarte el rol de administrador a ti mismo");
        }
        if (actual.getId().equals(id) && !req.activo()) {
            throw ReglaNegocioException.campo("activo", "No puedes desactivar tu propia cuenta");
        }
        boolean cambiaSeguridad = !u.getCorreo().equalsIgnoreCase(correo) || u.getRol().getCodigo() != req.rol()
                || (req.contrasena() != null && !req.contrasena().isEmpty()) || (u.isActivo() && !req.activo());
        u.setNombre(req.nombre().trim());
        u.setApellidos(req.apellidos().trim());
        u.setCorreo(correo);
        u.setRol(roles.findByCodigo(req.rol()).orElseThrow());
        u.setTelefono(Consultas.limpiar(req.telefono()));
        u.setCarrera(Consultas.limpiar(req.carrera()));
        u.setActivo(req.activo());
        if (req.contrasena() != null && !req.contrasena().isEmpty()) {
            u.setPasswordHash(encoder.encode(req.contrasena()));
        }
        if (cambiaSeguridad && !actual.getId().equals(id)) {
            sesiones.revocarTodas(id, LocalDateTime.now());
        }
        return UsuarioDto.de(u);
    }

    public UsuarioDto cambiarEstado(UsuarioPrincipal actual, Long id, boolean activo) {
        if (actual.getId().equals(id) && !activo) {
            throw ReglaNegocioException.campo("activo", "No puedes desactivar tu propia cuenta");
        }
        Usuario u = cargar(id);
        u.setActivo(activo);
        if (!activo) {
            sesiones.revocarTodas(id, LocalDateTime.now());
        }
        return UsuarioDto.de(u);
    }

    /** Borrado definitivo: se eliminan en cascada sus inscripciones, tareas, eventos y sesiones. */
    public void eliminar(UsuarioPrincipal actual, Long id) {
        if (actual.getId().equals(id)) {
            throw new ReglaNegocioException("No puedes eliminar tu propia cuenta");
        }
        Usuario u = cargar(id);
        recordatorios.borrarDeContenidoCreadoPor(id);
        usuarios.delete(u);
    }

    private Usuario cargar(Long id) {
        return usuarios.buscarConRol(id).orElseThrow(() -> RecursoNoEncontradoException.de("Usuario", id));
    }
}
