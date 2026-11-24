package com.dianova.dto.academico;

import com.dianova.domain.Enums.EstadoInscripcion;
import com.dianova.domain.HorarioClase;
import com.dianova.domain.Inscripcion;
import com.dianova.domain.PeriodoAcademico;
import com.dianova.dto.comun.Mini.MateriaMini;
import com.dianova.dto.comun.Mini.UsuarioMini;
import com.dianova.validation.ConRango;
import com.dianova.validation.RangoValido;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public final class AcademicoDtos {

    private AcademicoDtos() {
    }

    // ---------- Periodos ----------

    public record PeriodoDto(Long id, String nombre, LocalDate fechaInicio, LocalDate fechaFin, boolean activo) {
        public static PeriodoDto de(PeriodoAcademico p) {
            return p == null ? null : new PeriodoDto(p.getId(), p.getNombre(), p.getFechaInicio(), p.getFechaFin(), p.isActivo());
        }
    }

    @RangoValido(message = "La fecha de fin debe ser posterior a la de inicio")
    public record PeriodoRequest(
            @NotBlank(message = "El nombre es obligatorio")
            @Size(max = 40, message = "El nombre no puede superar 40 caracteres")
            String nombre,
            @NotNull(message = "La fecha de inicio es obligatoria") LocalDate fechaInicio,
            @NotNull(message = "La fecha de fin es obligatoria") LocalDate fechaFin,
            @NotNull(message = "Indica si el periodo está activo") Boolean activo) implements ConRango<LocalDate> {
        public LocalDate inicioRango() { return fechaInicio; }
        public LocalDate finRango() { return fechaFin; }
    }

    // ---------- Horarios ----------

    public record HorarioDto(Long id, Integer diaSemana, LocalTime horaInicio, LocalTime horaFin, String aula) {
        public static HorarioDto de(HorarioClase h) {
            return new HorarioDto(h.getId(), h.getDiaSemana(), h.getHoraInicio(), h.getHoraFin(), h.getAula());
        }
    }

    @RangoValido(message = "La hora de fin debe ser posterior a la de inicio")
    public record HorarioRequest(
            @NotNull(message = "Elige el día")
            @Min(value = 1, message = "Día inválido (1 = lunes)")
            @Max(value = 7, message = "Día inválido (7 = domingo)")
            Integer diaSemana,
            @NotNull(message = "La hora de inicio es obligatoria") LocalTime horaInicio,
            @NotNull(message = "La hora de fin es obligatoria") LocalTime horaFin,
            @Size(max = 60, message = "El aula no puede superar 60 caracteres") String aula) implements ConRango<LocalTime> {
        public LocalTime inicioRango() { return horaInicio; }
        public LocalTime finRango() { return horaFin; }
    }

    // ---------- Materias ----------

    public record MateriaDto(
            Long id, String codigoGrupo, String nombre, Integer creditos, String color, String aula, String descripcion,
            PeriodoDto periodo, UsuarioMini docente, List<HorarioDto> horarios,
            long totalInscritos,
            /* Solo para estudiantes: % de sus tareas completadas en la materia */
            Integer avance,
            /* Solo para estudiantes: tareas pendientes en la materia */
            Long tareasPendientes) {
    }

    public record MateriaRequest(
            @NotNull(message = "Elige el periodo") Long periodoId,
            Long docenteId,
            @NotBlank(message = "El código de grupo es obligatorio")
            @Size(max = 20, message = "El código no puede superar 20 caracteres")
            @Pattern(regexp = "^[A-Za-z0-9-]+$", message = "Usa solo letras, números y guiones")
            String codigoGrupo,
            @NotBlank(message = "El nombre es obligatorio")
            @Size(max = 120, message = "El nombre no puede superar 120 caracteres")
            String nombre,
            @NotNull(message = "Los créditos son obligatorios")
            @Min(value = 1, message = "Mínimo 1 crédito")
            @Max(value = 20, message = "Máximo 20 créditos")
            Integer creditos,
            @NotBlank(message = "Elige un color")
            @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "El color debe tener formato #RRGGBB")
            String color,
            @Size(max = 60, message = "El aula no puede superar 60 caracteres") String aula,
            @Size(max = 1000, message = "La descripción no puede superar 1000 caracteres") String descripcion) {
    }

    // ---------- Inscripciones (N:M estudiante-materia) ----------

    public record InscripcionDto(Long id, UsuarioMini estudiante, MateriaMini materia, LocalDateTime fechaInscripcion,
                                 EstadoInscripcion estado) {
        public static InscripcionDto de(Inscripcion i) {
            return new InscripcionDto(i.getId(), UsuarioMini.de(i.getEstudiante()), MateriaMini.de(i.getMateria()),
                    i.getFechaInscripcion(), i.getEstado());
        }
    }

    public record InscripcionRequest(@NotNull(message = "Elige un estudiante") Long estudianteId) {
    }

    public record EstadoInscripcionRequest(@NotNull(message = "Elige un estado") EstadoInscripcion estado) {
    }
}
