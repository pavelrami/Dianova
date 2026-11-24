package com.dianova.config;

import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.util.TimeZone;

/** Fechas de agenda en la hora local de la escuela (por defecto America/Mexico_City). */
@Configuration
public class ZonaHorariaConfig {

    private final DianovaProperties props;

    public ZonaHorariaConfig(DianovaProperties props) {
        this.props = props;
    }

    @PostConstruct
    void configurar() {
        String zona = props.zonaHoraria() == null || props.zonaHoraria().isBlank() ? "America/Mexico_City" : props.zonaHoraria();
        TimeZone.setDefault(TimeZone.getTimeZone(zona));
    }
}
