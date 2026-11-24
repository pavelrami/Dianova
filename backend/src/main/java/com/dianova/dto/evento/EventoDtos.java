package com.dianova.dto.evento;

import com.dianova.domain.Enums.EstadoEvento;
import com.dianova.domain.Enums.RespuestaParticipacion;
import com.dianova.domain.Enums.TipoEvento;
import com.dianova.domain.Evento;
import com.dianova.domain.ParticipacionEvento;
import com.dianova.dto.comun.Mini.MateriaMini;
import com.dianova.dto.comun.Mini.UsuarioMini;
import com.dianova.validation.ConRango;
import com.dianova.validation.RangoValido;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public final class EventoDtos {

    private EventoDtos() {
    }

    public record EventoDto(
            Long id, String titulo, String descripcion, String ubicacion, LocalDateTime inicio, LocalDateTime fin,
            TipoEvento tipo, EstadoEvento estado, MateriaMini materia, UsuarioMini creador,
            /* Respuesta del usuario actual si fue invitado */
            RespuestaParticipacion miRespuesta,
            long totalParticipantes, long confirmados) {

        public static EventoDto de(Evento e, RespuestaParticipacion miRespuesta, long total, long confirmados) {
            return new EventoDto(e.getId(), e.getTitulo(), e.getDescripcion(), e.getUbicacion(), e.getInicio(), e.getFin(),
                    e.getTipo(), e.getEstado(), MateriaMini.de(e.getMateria()), UsuarioMini.de(e.getCreador()),
                    miRespuesta, total, confirmados);
        }
    }

    @RangoValido(message = "El fin del evento debe ser posterior a su inicio")
    public record EventoRequest(
            @NotBlank(message = "El título es obligatorio")
            @Size(max = 150, message = "El título no puede superar 150 caracteres")
            String titulo,
            @Size(max = 2000, message = "La descripción no puede superar 2000 caracteres")
            String descripcion,
            @Size(max = 150, message = "La ubicación no puede superar 150 caracteres")
            String ubicacion,
            @NotNull(message = "La fecha de inicio es obligatoria")
            LocalDateTime inicio,
            @NotNull(message = "La fecha de fin es obligatoria")
            LocalDateTime fin,
            @NotNull(message = "Elige un tipo de evento")
            TipoEvento tipo,
            Long materiaId,
            EstadoEvento estado) implements ConRango<LocalDateTime> {
        public LocalDateTime inicioRango() { return inicio; }
        public LocalDateTime finRango() { return fin; }
    }

    public record RespuestaRequest(@NotNull(message = "Elige una respuesta") RespuestaParticipacion respuesta) {
    }

    public record AsistenciaRequest(@NotNull(message = "Indica si asistió") Boolean asistio) {
    }

    public record ParticipacionDto(Long id, UsuarioMini usuario, RespuestaParticipacion respuesta, Boolean asistio,
                                   LocalDateTime respondidoEn) {
        public static ParticipacionDto de(ParticipacionEvento p) {
            return new ParticipacionDto(p.getId(), UsuarioMini.de(p.getUsuario()), p.getRespuesta(), p.getAsistio(),
                    p.getRespondidoEn());
        }
    }
}
