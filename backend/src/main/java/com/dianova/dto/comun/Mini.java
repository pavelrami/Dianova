package com.dianova.dto.comun;

import com.dianova.domain.Evento;
import com.dianova.domain.Materia;
import com.dianova.domain.Tarea;
import com.dianova.domain.Usuario;

/** Representaciones cortas de entidades relacionadas para incrustar en otras respuestas. */
public final class Mini {

    private Mini() {
    }

    public record UsuarioMini(Long id, String nombreCompleto, String correo, String avatarUrl) {
        public static UsuarioMini de(Usuario u) {
            return u == null ? null : new UsuarioMini(u.getId(), u.getNombreCompleto(), u.getCorreo(), u.getAvatarUrl());
        }
    }

    public record MateriaMini(Long id, String nombre, String codigoGrupo, String color) {
        public static MateriaMini de(Materia m) {
            return m == null ? null : new MateriaMini(m.getId(), m.getNombre(), m.getCodigoGrupo(), m.getColor());
        }
    }

    public record Referencia(Long id, String titulo) {
        public static Referencia de(Tarea t) {
            return t == null ? null : new Referencia(t.getId(), t.getTitulo());
        }

        public static Referencia de(Evento e) {
            return e == null ? null : new Referencia(e.getId(), e.getTitulo());
        }
    }

    public record Mensaje(String mensaje) {
    }
}
