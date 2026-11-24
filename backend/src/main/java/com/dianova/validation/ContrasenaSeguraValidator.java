package com.dianova.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/** Devuelve un mensaje concreto según la primera regla que no se cumple (los mismos textos que muestra el frontend). */
public class ContrasenaSeguraValidator implements ConstraintValidator<ContrasenaSegura, String> {

    @Override
    public boolean isValid(String valor, ConstraintValidatorContext ctx) {
        // Nulo o vacío = "sin cambio" (por ejemplo, al editar un usuario). @NotBlank exige el valor cuando es obligatorio.
        if (valor == null || valor.isEmpty()) {
            return true;
        }
        String error = null;
        if (valor.length() < 8) {
            error = "La contraseña debe tener al menos 8 caracteres";
        } else if (valor.length() > 72) {
            error = "La contraseña no puede superar 72 caracteres";
        } else if (valor.chars().noneMatch(Character::isUpperCase)) {
            error = "La contraseña debe incluir al menos una letra mayúscula";
        } else if (valor.chars().noneMatch(Character::isDigit)) {
            error = "La contraseña debe incluir al menos un número";
        } else if (valor.chars().allMatch(Character::isLetterOrDigit)) {
            error = "La contraseña debe incluir al menos un carácter especial (por ejemplo # ! @ $)";
        } else if (valor.chars().anyMatch(Character::isWhitespace)) {
            error = "La contraseña no puede contener espacios";
        }
        if (error == null) {
            return true;
        }
        ctx.disableDefaultConstraintViolation();
        ctx.buildConstraintViolationWithTemplate(error).addConstraintViolation();
        return false;
    }
}
