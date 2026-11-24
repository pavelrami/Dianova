package com.dianova.web;

import com.dianova.domain.Enums.CanalNotificacion;
import com.dianova.domain.Enums.EstadoRecordatorio;
import com.dianova.dto.comun.PaginaDto;
import com.dianova.dto.recordatorio.RecordatorioDto;
import com.dianova.dto.recordatorio.RecordatorioRequest;
import com.dianova.security.Actual;
import com.dianova.service.RecordatorioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@PreAuthorize("isAuthenticated()")
public class RecordatorioController {

    private final RecordatorioService recordatorios;

    public RecordatorioController(RecordatorioService recordatorios) {
        this.recordatorios = recordatorios;
    }

    @GetMapping("/api/recordatorios")
    public PaginaDto<RecordatorioDto> mios(@RequestParam(required = false) EstadoRecordatorio estado,
                                           @RequestParam(required = false) CanalNotificacion canal,
                                           @RequestParam(required = false) String q,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "10") int size,
                                           @RequestParam(defaultValue = "programado") String orden,
                                           @RequestParam(defaultValue = "asc") String dir) {
        return recordatorios.listar(Actual.usuario(), false, estado, canal, q, page, size, orden, dir);
    }

    /** Supervisar recordatorios de todo el sistema (caso de uso del administrador). */
    @GetMapping("/api/admin/recordatorios")
    @PreAuthorize("hasRole('ADMIN')")
    public PaginaDto<RecordatorioDto> todos(@RequestParam(required = false) EstadoRecordatorio estado,
                                            @RequestParam(required = false) CanalNotificacion canal,
                                            @RequestParam(required = false) String q,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size,
                                            @RequestParam(defaultValue = "programado") String orden,
                                            @RequestParam(defaultValue = "desc") String dir) {
        return recordatorios.listar(Actual.usuario(), true, estado, canal, q, page, size, orden, dir);
    }

    @PostMapping("/api/recordatorios")
    @ResponseStatus(HttpStatus.CREATED)
    public RecordatorioDto crear(@Valid @RequestBody RecordatorioRequest req) {
        return recordatorios.crear(Actual.usuario(), req);
    }

    @PatchMapping("/api/recordatorios/{id}/cancelar")
    public RecordatorioDto cancelar(@PathVariable Long id) {
        return recordatorios.cancelar(Actual.usuario(), id);
    }

    /** Envía el recordatorio en este momento por su canal (correo, SMS o WhatsApp). */
    @PostMapping("/api/recordatorios/{id}/enviar")
    public RecordatorioDto enviarAhora(@PathVariable Long id) {
        return recordatorios.enviarAhora(Actual.usuario(), id);
    }

    @DeleteMapping("/api/recordatorios/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        recordatorios.eliminar(Actual.usuario(), id);
    }
}
