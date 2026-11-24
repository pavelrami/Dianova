package com.dianova.security;

import com.dianova.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Busca al usuario por correo (identificador de acceso) para el login con usuario y contraseña. */
@Service
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarios;

    public UsuarioDetailsService(UsuarioRepository usuarios) {
        this.usuarios = usuarios;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String correo) {
        return usuarios.buscarPorCorreo(correo.trim())
                .map(UsuarioPrincipal::de)
                .orElseThrow(() -> new UsernameNotFoundException("Correo no registrado"));
    }
}
