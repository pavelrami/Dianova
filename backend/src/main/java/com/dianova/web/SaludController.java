package com.dianova.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

/** Ping público para comprobar que la API responde (útil al desplegar en el VPS). */
@RestController
@RequestMapping("/api/salud")
public class SaludController {

    @GetMapping
    public Map<String, Object> salud() {
        return Map.of("estado", "ok", "servicio", "dianova-api", "hora", LocalDateTime.now());
    }
}
