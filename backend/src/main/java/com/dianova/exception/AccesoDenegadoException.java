package com.dianova.exception;

import org.springframework.security.access.AccessDeniedException;

/** 403: el usuario está autenticado pero no puede operar sobre este recurso (no es dueño, no está inscrito...). */
public class AccesoDenegadoException extends AccessDeniedException {

    public AccesoDenegadoException(String mensaje) {
        super(mensaje);
    }
}
