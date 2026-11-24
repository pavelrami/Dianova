package com.dianova.service;

import com.dianova.domain.Enums.EstadoInscripcion;
import com.dianova.domain.Enums.EstadoPublicacion;
import com.dianova.domain.Evento;
import com.dianova.domain.Materia;
import com.dianova.domain.Tarea;
import com.dianova.repository.InscripcionRepository;
import com.dianova.repository.ParticipacionRepository;
import com.dianova.repository.SeguimientoRepository;
import com.dianova.security.UsuarioPrincipal;
import org.springframework.stereotype.Component;

import java.util.Objects;

/**
 * Reglas de pertenencia (documento de modelado, regla 7): una tarea o evento no se muestra
 * por tener un ID conocido; siempre se verifica autoría, matrícula, docencia o rol de administrador.
 */
@Component
public class Permisos {

    private final InscripcionRepository inscripciones;
    private final SeguimientoRepository seguimientos;
    private final ParticipacionRepository participaciones;

    public Permisos(InscripcionRepository inscripciones, SeguimientoRepository seguimientos,
                    ParticipacionRepository participaciones) {
        this.inscripciones = inscripciones;
        this.seguimientos = seguimientos;
        this.participaciones = participaciones;
    }

    public boolean esDocenteDe(UsuarioPrincipal a, Materia m) {
        return m != null && m.getDocente() != null && Objects.equals(m.getDocente().getId(), a.getId());
    }

    public boolean inscritoEn(UsuarioPrincipal a, Materia m) {
        return m != null && inscripciones.existsByEstudianteIdAndMateriaIdAndEstado(a.getId(), m.getId(), EstadoInscripcion.ACTIVA);
    }

    public boolean gestionaMateria(UsuarioPrincipal a, Materia m) {
        return a.esAdmin() || esDocenteDe(a, m);
    }

    public boolean puedeVerMateria(UsuarioPrincipal a, Materia m) {
        return gestionaMateria(a, m) || inscritoEn(a, m);
    }

    public boolean gestionaTarea(UsuarioPrincipal a, Tarea t) {
        return a.esAdmin() || Objects.equals(t.getCreador().getId(), a.getId()) || esDocenteDe(a, t.getMateria());
    }

    public boolean puedeVerTarea(UsuarioPrincipal a, Tarea t) {
        return gestionaTarea(a, t) || (t.getEstadoPublicacion() == EstadoPublicacion.PUBLICADA
                && seguimientos.existsByTareaIdAndEstudianteId(t.getId(), a.getId()));
    }

    public boolean gestionaEvento(UsuarioPrincipal a, Evento e) {
        return a.esAdmin() || Objects.equals(e.getCreador().getId(), a.getId()) || esDocenteDe(a, e.getMateria());
    }

    public boolean puedeVerEvento(UsuarioPrincipal a, Evento e) {
        return gestionaEvento(a, e) || inscritoEn(a, e.getMateria())
                || participaciones.existsByEventoIdAndUsuarioId(e.getId(), a.getId());
    }
}
