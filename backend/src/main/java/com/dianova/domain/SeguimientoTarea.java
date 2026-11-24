package com.dianova.domain;

import com.dianova.domain.Enums.EstadoSeguimiento;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * Entidad asociativa de la relación N:M ESTUDIANTE &lt;-&gt; TAREA:
 * el progreso individual de cada estudiante sobre una tarea.
 */
@Entity
@Table(name = "seguimientos_tarea",
        uniqueConstraints = @UniqueConstraint(name = "uq_seguimientos_tarea_estudiante", columnNames = {"id_tarea", "id_estudiante"}))
public class SeguimientoTarea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_seguimiento")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_tarea", nullable = false)
    private Tarea tarea;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_estudiante", nullable = false)
    private Usuario estudiante;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 12)
    private EstadoSeguimiento estado = EstadoSeguimiento.PENDIENTE;

    @Column(name = "completada_en")
    private LocalDateTime completadaEn;

    @UpdateTimestamp
    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;

    public SeguimientoTarea() {
    }

    public SeguimientoTarea(Tarea tarea, Usuario estudiante) {
        this.tarea = tarea;
        this.estudiante = estudiante;
    }

    /** Aplica una transición del diagrama de estados y mantiene completada_en coherente. */
    public void cambiarEstado(EstadoSeguimiento nuevo) {
        this.estado = nuevo;
        this.completadaEn = nuevo == EstadoSeguimiento.COMPLETADA ? LocalDateTime.now() : null;
    }

    public Long getId() { return id; }
    public Tarea getTarea() { return tarea; }
    public void setTarea(Tarea tarea) { this.tarea = tarea; }
    public Usuario getEstudiante() { return estudiante; }
    public void setEstudiante(Usuario estudiante) { this.estudiante = estudiante; }
    public EstadoSeguimiento getEstado() { return estado; }
    public void setEstado(EstadoSeguimiento estado) { this.estado = estado; }
    public LocalDateTime getCompletadaEn() { return completadaEn; }
    public void setCompletadaEn(LocalDateTime completadaEn) { this.completadaEn = completadaEn; }
    public LocalDateTime getActualizadoEn() { return actualizadoEn; }
}
