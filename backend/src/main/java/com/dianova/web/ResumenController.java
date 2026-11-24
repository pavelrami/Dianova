package com.dianova.web;

import com.dianova.dto.resumen.ResumenDtos.AgendaItemDto;
import com.dianova.dto.resumen.ResumenDtos.ResumenDto;
import com.dianova.security.Actual;
import com.dianova.service.ResumenService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@PreAuthorize("isAuthenticated()")
public class ResumenController {

    private final ResumenService resumen;

    public ResumenController(ResumenService resumen) {
        this.resumen = resumen;
    }

    /** Panel principal adaptado al rol. */
    @GetMapping("/api/resumen")
    public ResumenDto resumen() {
        return resumen.resumen(Actual.usuario());
    }

    /** GET /api/calendario?desde=2026-11-23&hasta=2026-11-30&materiaId=3 */
    @GetMapping("/api/calendario")
    public List<AgendaItemDto> calendario(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
                                          @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
                                          @RequestParam(required = false) Long materiaId) {
        return resumen.calendario(Actual.usuario(), desde, hasta, materiaId);
    }
}
