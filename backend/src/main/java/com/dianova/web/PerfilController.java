package com.dianova.web;

import com.dianova.dto.comun.Mini.Mensaje;
import com.dianova.dto.usuario.UsuarioDtos.*;
import com.dianova.security.Actual;
import com.dianova.service.PerfilService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** Datos del usuario autenticado (cualquier rol). */
@RestController
@RequestMapping("/api/perfil")
@PreAuthorize("isAuthenticated()")
public class PerfilController {

    private final PerfilService perfil;

    public PerfilController(PerfilService perfil) {
        this.perfil = perfil;
    }

    @PutMapping
    public UsuarioDto actualizar(@Valid @RequestBody PerfilRequest req) {
        return perfil.actualizar(Actual.usuario(), req);
    }

    @PutMapping("/contrasena")
    public Mensaje cambiarContrasena(@Valid @RequestBody CambiarContrasenaRequest req) {
        perfil.cambiarContrasena(Actual.usuario(), req);
        return new Mensaje("Contraseña actualizada. Cerramos tus otras sesiones");
    }

    @GetMapping("/preferencias")
    public PreferenciasDto preferencias() {
        return perfil.preferencias(Actual.usuario());
    }

    @PutMapping("/preferencias")
    public PreferenciasDto actualizarPreferencias(@Valid @RequestBody PreferenciasRequest req) {
        return perfil.actualizarPreferencias(Actual.usuario(), req);
    }
}
