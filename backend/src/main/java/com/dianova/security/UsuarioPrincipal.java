package com.dianova.security;

import com.dianova.domain.Enums.RolCodigo;
import com.dianova.domain.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/** Usuario autenticado. La autoridad es ROLE_ADMIN, ROLE_DOCENTE o ROLE_ESTUDIANTE. */
public class UsuarioPrincipal implements UserDetails {

    private final Long id;
    private final String correo;
    private final String passwordHash;
    private final RolCodigo rol;
    private final boolean activo;
    /** Hash del JTI del token con que llegó la petición (para el logout). */
    private final String jtiHash;

    public UsuarioPrincipal(Long id, String correo, String passwordHash, RolCodigo rol, boolean activo, String jtiHash) {
        this.id = id;
        this.correo = correo;
        this.passwordHash = passwordHash;
        this.rol = rol;
        this.activo = activo;
        this.jtiHash = jtiHash;
    }

    public static UsuarioPrincipal de(Usuario u) {
        return new UsuarioPrincipal(u.getId(), u.getCorreo(), u.getPasswordHash(), u.getRol().getCodigo(), u.isActivo(), null);
    }

    public Long getId() { return id; }
    public RolCodigo getRol() { return rol; }
    public String getJtiHash() { return jtiHash; }

    public boolean esAdmin() { return rol == RolCodigo.ADMIN; }
    public boolean esDocente() { return rol == RolCodigo.DOCENTE; }
    public boolean esEstudiante() { return rol == RolCodigo.ESTUDIANTE; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + rol.name()));
    }

    @Override
    public String getPassword() { return passwordHash; }

    @Override
    public String getUsername() { return correo; }

    @Override
    public boolean isEnabled() { return activo; }
}
