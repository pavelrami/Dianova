package com.dianova.dto.recordatorio;

import com.dianova.domain.Enums.CanalNotificacion;
import com.dianova.validation.DestinoUnico;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@DestinoUnico
public record RecordatorioRequest(
        Long tareaId,
        Long eventoId,
        @NotNull(message = "Elige un canal")
        CanalNotificacion canal,
        @NotNull(message = "Elige la fecha y hora del recordatorio")
        @Future(message = "El recordatorio debe programarse en el futuro")
        LocalDateTime programadoPara,
        @Size(max = 500, message = "El mensaje no puede superar 500 caracteres")
        String mensaje) {
}
