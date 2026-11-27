package com.dianova.exception;

/** 503: un servicio externo (correo o SMS) no pudo entregar el mensaje. */
public class ServicioNoDisponibleException extends RuntimeException {

    public ServicioNoDisponibleException(String mensaje) {
        super(mensaje);
    }
}
