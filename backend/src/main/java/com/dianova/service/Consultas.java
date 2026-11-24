package com.dianova.service;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Utilidades para filtros y paginación del lado del servidor. */
public final class Consultas {

    public static final int TAMANO_MAXIMO = 50;

    private Consultas() {
    }

    /** "  Cálculo " -> "%cálculo%"; vacío -> null (sin filtro). */
    public static String like(String q) {
        return q == null || q.isBlank() ? null : "%" + q.trim().toLowerCase(Locale.ROOT) + "%";
    }

    public static Pageable pagina(int page, int size, Sort sort) {
        int tamano = Math.min(Math.max(size, 1), TAMANO_MAXIMO);
        return PageRequest.of(Math.max(page, 0), tamano, sort);
    }

    public static Sort.Direction direccion(String dir) {
        return "desc".equalsIgnoreCase(dir) ? Sort.Direction.DESC : Sort.Direction.ASC;
    }

    /** Convierte filas [id, valor] de una consulta agregada en un mapa. */
    public static <V> Map<Long, V> mapa(List<Object[]> filas, Function<Object[], V> valor) {
        return filas.stream().collect(Collectors.toMap(f -> (Long) f[0], valor, (a, b) -> a));
    }

    public static long num(Object o) {
        return o == null ? 0L : ((Number) o).longValue();
    }

    public static String limpiar(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
