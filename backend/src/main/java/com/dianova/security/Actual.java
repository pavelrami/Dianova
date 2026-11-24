package com.dianova.security;

import com.dianova.exception.AccesoDenegadoException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/** Acceso al usuario autenticado de la petición en curso. */
public final class Actual {

    private Actual() {
    }

    public static UsuarioPrincipal usuario() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UsuarioPrincipal principal)) {
            throw new AccesoDenegadoException("Necesitas iniciar sesión");
        }
        return principal;
    }
}
