package com.dianova.dto.tarea;

import com.dianova.domain.Enums.EstadoPublicacion;
import com.dianova.domain.Enums.EstadoSeguimiento;
import com.dianova.domain.Enums.OrigenTarea;
import com.dianova.domain.Enums.Prioridad;
import com.dianova.domain.SeguimientoTarea;
import com.dianova.domain.Tarea;
import com.dianova.dto.comun.Mini.MateriaMini;
import com.dianova.dto.comun.Mini.UsuarioMini;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public final class TareaDtos {

    private TareaDtos() {
    }

    public record TareaDto(
            Long id, String titulo, String descripcion, LocalDateTime fechaEntrega, Prioridad prioridad,
            OrigenTarea origen, EstadoPublicacion estadoPublicacion, LocalDateTime publicadaEn,
            MateriaMini materia, UsuarioMini creador,
            /* Para estudiantes: su propio avance */
            SeguimientoMini miSeguimiento,
            /* Para docentes y administradores: avance del grupo */
            AvanceDto avance,
            LocalDateTime creadoEn) {

        public static TareaDto de(Tarea t, SeguimientoMini mio, AvanceDto avance) {
            return new TareaDto(t.getId(), t.getTitulo(), t.getDescripcion(), t.getFechaEntrega(), t.getPrioridad(),
                    t.getOrigen(), t.getEstadoPublicacion(), t.getPublicadaEn(), MateriaMini.de(t.getMateria()),
                    UsuarioMini.de(t.getCreador()), mio, avance, t.getCreadoEn());
        }
    }

    public record SeguimientoMini(Long id, EstadoSeguimiento estado, LocalDateTime completadaEn) {
        public static SeguimientoMini de(SeguimientoTarea s) {
            return s == null ? null : new SeguimientoMini(s.getId(), s.getEstado(), s.getCompletadaEn());
        }
    }

    public record AvanceDto(long total, long completadas, long enProceso) {
        public static final AvanceDto VACIO = new AvanceDto(0, 0, 0);
    }

    public record TareaRequest(
            @NotBlank(message = "El título es obligatorio")
            @Size(max = 150, message = "El título no puede superar 150 caracteres")
            String titulo,
            @Size(max = 2000, message = "La descripción no puede superar 2000 caracteres")
            String descripcion,
            @NotNull(message = "La fecha de entrega es obligatoria")
            LocalDateTime fechaEntrega,
            @NotNull(message = "Elige una prioridad")
            Prioridad prioridad,
            /* Obligatoria para docentes; opcional para estudiantes (tarea personal ligada a una materia) */
            Long materiaId,
            /* Solo docentes: true publica de inmediato, false la deja en borrador */
            Boolean publicar) {
    }

    public record ProgresoRequest(@NotNull(message = "Elige un estado") EstadoSeguimiento estado) {
    }

    public record SeguimientoDto(Long id, UsuarioMini estudiante, EstadoSeguimiento estado, LocalDateTime completadaEn,
                                 LocalDateTime actualizadoEn) {
        public static SeguimientoDto de(SeguimientoTarea s) {
            return new SeguimientoDto(s.getId(), UsuarioMini.de(s.getEstudiante()), s.getEstado(), s.getCompletadaEn(),
                    s.getActualizadoEn());
        }
    }
}
