package com.dianova.web;

import com.dianova.domain.Enums.EstadoInscripcion;
import com.dianova.dto.academico.AcademicoDtos.*;
import com.dianova.dto.comun.PaginaDto;
import com.dianova.security.Actual;
import com.dianova.service.MateriaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materias")
@PreAuthorize("isAuthenticated()")
public class MateriaController {

    private final MateriaService materias;

    public MateriaController(MateriaService materias) {
        this.materias = materias;
    }

    /** El resultado depende del rol: admin todas, docente las suyas, estudiante sus inscritas. */
    @GetMapping
    public PaginaDto<MateriaDto> listar(@RequestParam(required = false) String q,
                                        @RequestParam(required = false) Long periodoId,
                                        @RequestParam(required = false) Long docenteId,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "10") int size,
                                        @RequestParam(defaultValue = "nombre") String orden,
                                        @RequestParam(defaultValue = "asc") String dir) {
        return materias.listar(Actual.usuario(), q, periodoId, docenteId, page, size, orden, dir);
    }

    @GetMapping("/{id}")
    public MateriaDto obtener(@PathVariable Long id) {
        return materias.obtener(Actual.usuario(), id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public MateriaDto crear(@Valid @RequestBody MateriaRequest req) {
        return materias.crear(Actual.usuario(), req);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public MateriaDto actualizar(@PathVariable Long id, @Valid @RequestBody MateriaRequest req) {
        return materias.actualizar(Actual.usuario(), id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        materias.eliminar(id);
    }

    // ---------- horarios ----------

    @GetMapping("/{id}/horarios")
    public List<HorarioDto> horarios(@PathVariable Long id) {
        return materias.horarios(Actual.usuario(), id);
    }

    @PostMapping("/{id}/horarios")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public HorarioDto crearHorario(@PathVariable Long id, @Valid @RequestBody HorarioRequest req) {
        return materias.crearHorario(id, req);
    }

    @PutMapping("/{id}/horarios/{horarioId}")
    @PreAuthorize("hasRole('ADMIN')")
    public HorarioDto actualizarHorario(@PathVariable Long id, @PathVariable Long horarioId, @Valid @RequestBody HorarioRequest req) {
        return materias.actualizarHorario(id, horarioId, req);
    }

    @DeleteMapping("/{id}/horarios/{horarioId}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarHorario(@PathVariable Long id, @PathVariable Long horarioId) {
        materias.eliminarHorario(id, horarioId);
    }

    // ---------- inscripciones (N:M estudiante-materia) ----------

    @GetMapping("/{id}/inscripciones")
    @PreAuthorize("hasAnyRole('ADMIN','DOCENTE')")
    public PaginaDto<InscripcionDto> inscritos(@PathVariable Long id,
                                               @RequestParam(required = false) String q,
                                               @RequestParam(required = false) EstadoInscripcion estado,
                                               @RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "10") int size) {
        return materias.inscritos(Actual.usuario(), id, q, estado, page, size);
    }

    @PostMapping("/{id}/inscripciones")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public InscripcionDto inscribir(@PathVariable Long id, @Valid @RequestBody InscripcionRequest req) {
        return materias.inscribir(id, req);
    }

    @PatchMapping("/inscripciones/{inscripcionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public InscripcionDto cambiarEstado(@PathVariable Long inscripcionId, @Valid @RequestBody EstadoInscripcionRequest req) {
        return materias.cambiarEstadoInscripcion(inscripcionId, req.estado());
    }

    @DeleteMapping("/inscripciones/{inscripcionId}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarInscripcion(@PathVariable Long inscripcionId) {
        materias.eliminarInscripcion(inscripcionId);
    }
}
