package com.dianova.validation;

/** Contrato de los DTO que tienen un rango inicio-fin (eventos, horarios, periodos). */
public interface ConRango<T extends Comparable<? super T>> {

    T inicioRango();

    T finRango();
}
