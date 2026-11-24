package com.dianova.web;

import com.dianova.dto.academico.AcademicoDtos.PeriodoDto;
import com.dianova.dto.academico.AcademicoDtos.PeriodoRequest;
import com.dianova.dto.comun.PaginaDto;
import com.dianova.service.PeriodoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** Periodos académicos: cualquier usuario autenticado los consulta; solo el administrador los modifica. */
@RestController
@RequestMapping("/api/periodos")
public class PeriodoController {

    private final PeriodoService periodos;

    public PeriodoController(PeriodoService periodos) {
        this.periodos = periodos;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public PaginaDto<PeriodoDto> listar(@RequestParam(required = false) String q,
                                        @RequestParam(required = false) Boolean activo,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "10") int size) {
        return periodos.listar(q, activo, page, size);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public PeriodoDto obtener(@PathVariable Long id) {
        return periodos.obtener(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public PeriodoDto crear(@Valid @RequestBody PeriodoRequest req) {
        return periodos.crear(req);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public PeriodoDto actualizar(@PathVariable Long id, @Valid @RequestBody PeriodoRequest req) {
        return periodos.actualizar(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        periodos.eliminar(id);
    }
}
