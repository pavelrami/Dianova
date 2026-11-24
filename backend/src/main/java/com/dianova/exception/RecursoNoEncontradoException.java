package com.dianova.exception;

/** 404: el recurso no existe o el usuario no tiene forma de verlo. */
public class RecursoNoEncontradoException extends RuntimeException {

    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }

    public static RecursoNoEncontradoException de(String recurso, Object id) {
        return new RecursoNoEncontradoException(recurso + " con id " + id + " no existe");
    }
}
