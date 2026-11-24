package com.dianova.service;

import com.dianova.domain.PeriodoAcademico;
import com.dianova.dto.academico.AcademicoDtos.PeriodoDto;
import com.dianova.dto.academico.AcademicoDtos.PeriodoRequest;
import com.dianova.dto.comun.PaginaDto;
import com.dianova.exception.RecursoNoEncontradoException;
import com.dianova.exception.ReglaNegocioException;
import com.dianova.repository.MateriaRepository;
import com.dianova.repository.PeriodoRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PeriodoService {

    private final PeriodoRepository periodos;
    private final MateriaRepository materias;

    public PeriodoService(PeriodoRepository periodos, MateriaRepository materias) {
        this.periodos = periodos;
        this.materias = materias;
    }

    @Transactional(readOnly = true)
    public PaginaDto<PeriodoDto> listar(String q, Boolean activo, int page, int size) {
        return PaginaDto.de(periodos.buscar(Consultas.like(q), activo,
                Consultas.pagina(page, size, Sort.by(Sort.Direction.DESC, "fechaInicio"))), PeriodoDto::de);
    }

    @Transactional(readOnly = true)
    public PeriodoDto obtener(Long id) {
        return PeriodoDto.de(cargar(id));
    }

    public PeriodoDto crear(PeriodoRequest req) {
        if (periodos.existsByNombreIgnoreCase(req.nombre().trim())) {
            throw ReglaNegocioException.campo("nombre", "Ya existe un periodo con ese nombre");
        }
        PeriodoAcademico p = new PeriodoAcademico();
        aplicar(p, req);
        return PeriodoDto.de(periodos.save(p));
    }

    public PeriodoDto actualizar(Long id, PeriodoRequest req) {
        PeriodoAcademico p = cargar(id);
        if (periodos.existsByNombreIgnoreCaseAndIdNot(req.nombre().trim(), id)) {
            throw ReglaNegocioException.campo("nombre", "Ya existe un periodo con ese nombre");
        }
        aplicar(p, req);
        return PeriodoDto.de(p);
    }

    public void eliminar(Long id) {
        PeriodoAcademico p = cargar(id);
        if (materias.existsByPeriodoId(id)) {
            throw new ReglaNegocioException("No puedes eliminar un periodo que tiene materias. Elimina o mueve sus materias primero");
        }
        periodos.delete(p);
    }

    /** Solo un periodo puede estar activo a la vez. */
    private void aplicar(PeriodoAcademico p, PeriodoRequest req) {
        p.setNombre(req.nombre().trim());
        p.setFechaInicio(req.fechaInicio());
        p.setFechaFin(req.fechaFin());
        if (Boolean.TRUE.equals(req.activo())) {
            periodos.findAll().stream().filter(o -> o.isActivo() && !o.equals(p)).forEach(o -> o.setActivo(false));
        }
        p.setActivo(Boolean.TRUE.equals(req.activo()));
    }

    private PeriodoAcademico cargar(Long id) {
        return periodos.findById(id).orElseThrow(() -> RecursoNoEncontradoException.de("Periodo", id));
    }
}
