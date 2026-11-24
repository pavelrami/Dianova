package com.dianova.validation;

import com.dianova.dto.recordatorio.RecordatorioRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class DestinoUnicoValidator implements ConstraintValidator<DestinoUnico, RecordatorioRequest> {

    @Override
    public boolean isValid(RecordatorioRequest valor, ConstraintValidatorContext ctx) {
        if (valor == null) {
            return true;
        }
        return (valor.tareaId() == null) != (valor.eventoId() == null);
    }
}
