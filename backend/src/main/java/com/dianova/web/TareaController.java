package com.dianova.web;

import com.dianova.domain.Enums.*;
import com.dianova.dto.comun.PaginaDto;
import com.dianova.dto.tarea.TareaDtos.*;
import com.dianova.security.Actual;
import com.dianova.service.TareaService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/tareas")
@PreAuthorize("isAuthenticated()")
public class TareaController {

    private final TareaService tareas;

    public TareaController(TareaService tareas) {
        this.tareas = tareas;
    }

    /**
     * Estudiante: sus tareas con su estado. Docente: las que publicó y su avance. Admin: todas.
     * Ej.: GET /api/tareas?q=reporte&materiaId=3&prioridad=ALTA&estado=PENDIENTE&page=0&size=10&orden=entrega
     */
    @GetMapping
    public PaginaDto<TareaDto> listar(@RequestParam(required = false) String q,
                                      @RequestParam(required = false) Long materiaId,
                                      @RequestParam(required = false) Prioridad prioridad,
                                      @RequestParam(required = false) EstadoSeguimiento estado,
                                      @RequestParam(defaultValue = "false") boolean pendientes,
                                      @RequestParam(required = false) EstadoPublicacion publicacion,
                                      @RequestParam(required = false) OrigenTarea origen,
                                      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
                                      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta,
                                      @RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "10") int size,
                                      @RequestParam(defaultValue = "entrega") String orden,
                                      @RequestParam(defaultValue = "asc") String dir) {
        return tareas.listar(Actual.usuario(), new TareaService.Filtros(q, materiaId, prioridad, estado, pendientes,
                publicacion, origen, desde, hasta, orden, dir), page, size);
    }

    @GetMapping("/{id}")
    public TareaDto obtener(@PathVariable Long id) {
        return tareas.obtener(Actual.usuario(), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TareaDto crear(@Valid @RequestBody TareaRequest req) {
        return tareas.crear(Actual.usuario(), req);
    }

    @PutMapping("/{id}")
    public TareaDto actualizar(@PathVariable Long id, @Valid @RequestBody TareaRequest req) {
        return tareas.actualizar(Actual.usuario(), id, req);
    }

    @PostMapping("/{id}/publicar")
    @PreAuthorize("hasAnyRole('DOCENTE','ADMIN')")
    public TareaDto publicar(@PathVariable Long id) {
        return tareas.publicar(Actual.usuario(), id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        tareas.eliminar(Actual.usuario(), id);
    }

    /** "Actualizar mi progreso" (solo estudiantes). */
    @PatchMapping("/{id}/progreso")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public TareaDto progreso(@PathVariable Long id, @Valid @RequestBody ProgresoRequest req) {
        return tareas.actualizarProgreso(Actual.usuario(), id, req.estado());
    }

    @GetMapping("/{id}/seguimientos")
    @PreAuthorize("hasAnyRole('DOCENTE','ADMIN')")
    public PaginaDto<SeguimientoDto> seguimientos(@PathVariable Long id,
                                                  @RequestParam(required = false) EstadoSeguimiento estado,
                                                  @RequestParam(required = false) String q,
                                                  @RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "10") int size) {
        return tareas.seguimientos(Actual.usuario(), id, estado, q, page, size);
    }
}
