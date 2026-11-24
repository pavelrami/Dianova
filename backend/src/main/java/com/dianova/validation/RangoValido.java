package com.dianova.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Restricción de clase: el fin del rango debe ser posterior al inicio.
 * La clase anotada implementa {@link ConRango}.
 */
@Documented
@Constraint(validatedBy = RangoValidoValidator.class)
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface RangoValido {

    String message() default "La fecha u hora de fin debe ser posterior a la de inicio";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
