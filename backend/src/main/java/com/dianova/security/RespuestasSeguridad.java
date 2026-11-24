package com.dianova.security;

import com.dianova.exception.ErrorApi;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/** Respuestas JSON para los rechazos que ocurren en la cadena de filtros (antes de llegar al controlador). */
@Component
public class RespuestasSeguridad {

    private final ObjectMapper mapper;

    public RespuestasSeguridad(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    /** 401: no hay token, es inválido, expiró o fue revocado. */
    public AuthenticationEntryPoint noAutenticado() {
        return (req, res, ex) -> escribir(res, 401, "Unauthorized",
                "Tu sesión no es válida o expiró. Inicia sesión de nuevo", req.getRequestURI());
    }

    /** 403: hay sesión pero el rol no alcanza para esta ruta. */
    public AccessDeniedHandler sinPermiso() {
        return (req, res, ex) -> escribir(res, 403, "Forbidden",
                "No tienes permiso para acceder a este recurso", req.getRequestURI());
    }

    private void escribir(HttpServletResponse res, int estado, String error, String mensaje, String ruta) throws IOException {
        res.setStatus(estado);
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        res.setCharacterEncoding("UTF-8");
        mapper.writeValue(res.getOutputStream(), ErrorApi.de(estado, error, mensaje, ruta));
    }
}
