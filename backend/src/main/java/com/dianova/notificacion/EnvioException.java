package com.dianova.notificacion;

/**
 * Fallo al enviar un mensaje. Si no es reintentable (datos o configuración), el recordatorio
 * pasa directo a FALLIDO; si lo es (red, servidor ocupado), se reintenta más tarde.
 */
public class EnvioException extends RuntimeException {

    private final boolean reintentable;

    public EnvioException(String mensaje, boolean reintentable) {
        super(mensaje);
        this.reintentable = reintentable;
    }

    public EnvioException(String mensaje, boolean reintentable, Throwable causa) {
        super(mensaje, causa);
        this.reintentable = reintentable;
    }

    public static EnvioException definitivo(String mensaje) {
        return new EnvioException(mensaje, false);
    }

    public boolean isReintentable() {
        return reintentable;
    }
}
