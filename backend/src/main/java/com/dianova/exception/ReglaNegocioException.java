package com.dianova.exception;

import java.util.Map;

/** 422: los datos tienen formato válido pero violan una regla del negocio (correo repetido, transición inválida...). */
public class ReglaNegocioException extends RuntimeException {

    private final Map<String, String> errores;

    public ReglaNegocioException(String mensaje) {
        this(mensaje, Map.of());
    }

    public ReglaNegocioException(String mensaje, Map<String, String> errores) {
        super(mensaje);
        this.errores = errores;
    }

    /** Error ligado a un campo, para que el frontend lo muestre bajo el input correspondiente. */
    public static ReglaNegocioException campo(String campo, String mensaje) {
        return new ReglaNegocioException(mensaje, Map.of(campo, mensaje));
    }

    public Map<String, String> getErrores() {
        return errores;
    }
}
