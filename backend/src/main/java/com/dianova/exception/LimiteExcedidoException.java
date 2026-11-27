package com.dianova.exception;

/** 429: se pidieron demasiados códigos en poco tiempo. */
public class LimiteExcedidoException extends RuntimeException {

    private final long segundosEspera;

    public LimiteExcedidoException(String mensaje, long segundosEspera) {
        super(mensaje);
        this.segundosEspera = segundosEspera;
    }

    public long getSegundosEspera() {
        return segundosEspera;
    }
}
