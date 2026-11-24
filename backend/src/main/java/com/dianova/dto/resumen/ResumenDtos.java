package com.dianova.dto.resumen;

import com.dianova.domain.Enums.RolCodigo;
import com.dianova.dto.evento.EventoDtos.EventoDto;
import com.dianova.dto.tarea.TareaDtos.TareaDto;

import java.time.LocalDateTime;
import java.util.List;

public final class ResumenDtos {

    private ResumenDtos() {
    }

    /** Panel principal ("Resumen") adaptado al rol del usuario. */
    public record ResumenDto(
            RolCodigo rol,
            List<MetricaDto> metricas,
            Integer progresoSemanal,
            ClaseDto proximaClase,
            List<AgendaItemDto> agendaHoy,
            List<TareaDto> tareasPrioritarias,
            List<EventoDto> proximosEventos) {
    }

    public record MetricaDto(String clave, String etiqueta, long valor, String detalle) {
    }

    public record ClaseDto(Long materiaId, String materia, String color, String aula, String docente,
                           LocalDateTime inicio, LocalDateTime fin) {
    }

    /**
     * Elemento de agenda o calendario. tipo: CLASE (de horarios_clase), EVENTO o ENTREGA (fecha límite de una tarea).
     * subtipo: tipo de evento (EXAMEN, TALLER...) o prioridad de la tarea.
     */
    public record AgendaItemDto(String tipo, String subtipo, Long referenciaId, String titulo, String detalle,
                                String lugar, String color, LocalDateTime inicio, LocalDateTime fin) {
    }
}
