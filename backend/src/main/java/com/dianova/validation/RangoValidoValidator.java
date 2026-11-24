package com.dianova.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class RangoValidoValidator implements ConstraintValidator<RangoValido, ConRango<?>> {

    @Override
    @SuppressWarnings({"unchecked", "rawtypes"})
    public boolean isValid(ConRango<?> valor, ConstraintValidatorContext ctx) {
        if (valor == null) {
            return true;
        }
        Comparable inicio = valor.inicioRango();
        Comparable fin = valor.finRango();
        // Si falta alguno, @NotNull del campo se encarga del mensaje
        if (inicio == null || fin == null) {
            return true;
        }
        return fin.compareTo(inicio) > 0;
    }
}
