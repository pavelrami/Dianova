package com.dianova.web;

import com.dianova.domain.Enums.EstadoEvento;
import com.dianova.domain.Enums.RespuestaParticipacion;
import com.dianova.domain.Enums.TipoEvento;
import com.dianova.dto.comun.PaginaDto;
import com.dianova.dto.evento.EventoDtos.*;
import com.dianova.security.Actual;
import com.dianova.service.EventoService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/eventos")
@PreAuthorize("isAuthenticated()")
public class EventoController {

    private final EventoService eventos;

    public EventoController(EventoService eventos) {
        this.eventos = eventos;
    }

    @GetMapping
    public PaginaDto<EventoDto> listar(@RequestParam(required = false) String q,
                                       @RequestParam(required = false) TipoEvento tipo,
                                       @RequestParam(required = false) Long materiaId,
                                       @RequestParam(required = false) EstadoEvento estado,
                                       @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
                                       @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta,
                                       @RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "10") int size,
                                       @RequestParam(defaultValue = "asc") String dir) {
        return eventos.listar(Actual.usuario(), new EventoService.Filtros(q, tipo, materiaId, estado, desde, hasta, dir), page, size);
    }

    @GetMapping("/{id}")
    public EventoDto obtener(@PathVariable Long id) {
        return eventos.obtener(Actual.usuario(), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventoDto crear(@Valid @RequestBody EventoRequest req) {
        return eventos.crear(Actual.usuario(), req);
    }

    @PutMapping("/{id}")
    public EventoDto actualizar(@PathVariable Long id, @Valid @RequestBody EventoRequest req) {
        return eventos.actualizar(Actual.usuario(), id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        eventos.eliminar(Actual.usuario(), id);
    }

    @PostMapping("/{id}/respuesta")
    public EventoDto responder(@PathVariable Long id, @Valid @RequestBody RespuestaRequest req) {
        return eventos.responder(Actual.usuario(), id, req.respuesta());
    }

    @GetMapping("/{id}/participantes")
    @PreAuthorize("hasAnyRole('DOCENTE','ADMIN')")
    public PaginaDto<ParticipacionDto> participantes(@PathVariable Long id,
                                                     @RequestParam(required = false) RespuestaParticipacion respuesta,
                                                     @RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "10") int size) {
        return eventos.participantes(Actual.usuario(), id, respuesta, page, size);
    }

    @PatchMapping("/{id}/participantes/{participacionId}/asistencia")
    @PreAuthorize("hasAnyRole('DOCENTE','ADMIN')")
    public ParticipacionDto asistencia(@PathVariable Long id, @PathVariable Long participacionId,
                                       @Valid @RequestBody AsistenciaRequest req) {
        return eventos.marcarAsistencia(Actual.usuario(), id, participacionId, req.asistio());
    }
}
