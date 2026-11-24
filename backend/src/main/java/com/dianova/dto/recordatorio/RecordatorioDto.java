package com.dianova.dto.recordatorio;

import com.dianova.domain.Enums.CanalNotificacion;
import com.dianova.domain.Enums.EstadoRecordatorio;
import com.dianova.domain.Recordatorio;
import com.dianova.dto.comun.Mini.Referencia;
import com.dianova.dto.comun.Mini.UsuarioMini;

import java.time.LocalDateTime;

public record RecordatorioDto(
        Long id, CanalNotificacion canal, LocalDateTime programadoPara, String mensaje, EstadoRecordatorio estado,
        Integer intentos, LocalDateTime enviadoEn, String detalleError, Referencia tarea, Referencia evento,
        UsuarioMini usuario, LocalDateTime creadoEn) {

    public static RecordatorioDto de(Recordatorio r) {
        return new RecordatorioDto(r.getId(), r.getCanal(), r.getProgramadoPara(), r.getMensaje(), r.getEstado(),
                r.getIntentos(), r.getEnviadoEn(), r.getDetalleError(), Referencia.de(r.getTarea()),
                Referencia.de(r.getEvento()), UsuarioMini.de(r.getUsuario()), r.getCreadoEn());
    }
}
