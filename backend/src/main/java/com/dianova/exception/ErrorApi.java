package com.dianova.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Formato único de error de la API.
 * Ejemplo: {"estado":400,"error":"Bad Request","mensaje":"Hay datos inválidos","ruta":"/api/tareas","errores":{"titulo":"El título es obligatorio"}}
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ErrorApi(
        LocalDateTime fecha,
        int estado,
        String error,
        String mensaje,
        String ruta,
        Map<String, String> errores) {

    public static ErrorApi de(int estado, String error, String mensaje, String ruta) {
        return new ErrorApi(LocalDateTime.now(), estado, error, mensaje, ruta, Map.of());
    }

    public static ErrorApi de(int estado, String error, String mensaje, String ruta, Map<String, String> errores) {
        return new ErrorApi(LocalDateTime.now(), estado, error, mensaje, ruta, errores);
    }
}
