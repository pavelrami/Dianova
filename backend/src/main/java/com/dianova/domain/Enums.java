package com.dianova.domain;

/**
 * Catálogos de estados del dominio. Se guardan como texto (VARCHAR + CHECK en MySQL).
 */
public final class Enums {

    private Enums() {
    }

    public enum RolCodigo { ADMIN, DOCENTE, ESTUDIANTE }

    public enum EstadoInscripcion { ACTIVA, BAJA, FINALIZADA }

    public enum Prioridad { ALTA, MEDIA, BAJA }

    /** PERSONAL: la crea un estudiante para sí mismo. DOCENTE: la publica un docente para su materia. */
    public enum OrigenTarea { PERSONAL, DOCENTE }

    /** Ciclo de vida de la definición de una tarea (diagrama de estados, figura 6). */
    public enum EstadoPublicacion { BORRADOR, PUBLICADA }

    /** Avance individual de cada estudiante sobre una tarea. */
    public enum EstadoSeguimiento { PENDIENTE, EN_PROCESO, COMPLETADA }

    public enum TipoEvento { CLASE, EXAMEN, ENTREGA, TALLER, ESTUDIO, ASESORIA, SOCIAL, PERSONAL }

    public enum EstadoEvento { PROGRAMADO, CANCELADO, FINALIZADO }

    public enum RespuestaParticipacion { PENDIENTE, CONFIRMADA, RECHAZADA }

    public enum CanalNotificacion { EMAIL, SMS, WHATSAPP }

    public enum EstadoRecordatorio { PENDIENTE, ENVIADO, FALLIDO, CANCELADO }

    /** Para qué sirve un código de verificación de un solo uso. */
    public enum PropositoCodigo { REGISTRO, RECUPERACION }
}
