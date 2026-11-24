package com.dianova.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/** Restricción de clase: un recordatorio apunta a una tarea o a un evento, nunca a ambos ni a ninguno. */
@Documented
@Constraint(validatedBy = DestinoUnicoValidator.class)
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface DestinoUnico {

    String message() default "Elige una tarea o un evento (solo uno)";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
