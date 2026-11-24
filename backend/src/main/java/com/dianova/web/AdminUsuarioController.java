package com.dianova.web;

import com.dianova.domain.Enums.RolCodigo;
import com.dianova.dto.comun.PaginaDto;
import com.dianova.dto.usuario.UsuarioDtos.*;
import com.dianova.security.Actual;
import com.dianova.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** Gestión de usuarios y roles. Doble candado: /api/admin/** en SecurityFilterChain y @PreAuthorize. */
@RestController
@RequestMapping("/api/admin/usuarios")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUsuarioController {

    private final UsuarioService usuarios;

    public AdminUsuarioController(UsuarioService usuarios) {
        this.usuarios = usuarios;
    }

    /** GET /api/admin/usuarios?q=ana&rol=DOCENTE&activo=true&page=0&size=10&orden=nombre&dir=asc */
    @GetMapping
    public PaginaDto<UsuarioDto> listar(@RequestParam(required = false) String q,
                                        @RequestParam(required = false) RolCodigo rol,
                                        @RequestParam(required = false) Boolean activo,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "10") int size,
                                        @RequestParam(defaultValue = "nombre") String orden,
                                        @RequestParam(defaultValue = "asc") String dir) {
        return usuarios.listar(q, rol, activo, page, size, orden, dir);
    }

    @GetMapping("/{id}")
    public UsuarioDto obtener(@PathVariable Long id) {
        return usuarios.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioDto crear(@Valid @RequestBody UsuarioCrearRequest req) {
        return usuarios.crear(req);
    }

    @PutMapping("/{id}")
    public UsuarioDto actualizar(@PathVariable Long id, @Valid @RequestBody UsuarioActualizarRequest req) {
        return usuarios.actualizar(Actual.usuario(), id, req);
    }

    @PatchMapping("/{id}/estado")
    public UsuarioDto cambiarEstado(@PathVariable Long id, @Valid @RequestBody EstadoUsuarioRequest req) {
        return usuarios.cambiarEstado(Actual.usuario(), id, req.activo());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        usuarios.eliminar(Actual.usuario(), id);
    }
}
