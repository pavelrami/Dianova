package com.dianova.web;

import com.dianova.domain.Rol;
import com.dianova.repository.RolRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Catálogo de roles (tabla roles) para los formularios del administrador. */
@RestController
@RequestMapping("/api/admin/roles")
@PreAuthorize("hasRole('ADMIN')")
public class AdminRolController {

    private final RolRepository roles;

    public AdminRolController(RolRepository roles) {
        this.roles = roles;
    }

    public record RolDto(Long id, String codigo, String nombre, String descripcion) {
        static RolDto de(Rol r) {
            return new RolDto(r.getId(), r.getCodigo().name(), r.getNombre(), r.getDescripcion());
        }
    }

    @GetMapping
    public List<RolDto> listar() {
        return roles.findAll().stream().map(RolDto::de).toList();
    }
}
