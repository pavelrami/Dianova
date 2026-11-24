package com.dianova.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "materias",
        uniqueConstraints = @UniqueConstraint(name = "uq_materias_periodo_grupo", columnNames = {"id_periodo", "codigo_grupo"}))
public class Materia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_materia")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_periodo", nullable = false)
    private PeriodoAcademico periodo;

    /** Docente asignado (opcional). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_docente")
    private Usuario docente;

    @Column(name = "codigo_grupo", nullable = false, length = 20)
    private String codigoGrupo;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(nullable = false)
    private Integer creditos;

    @Column(nullable = false, length = 7)
    private String color = "#C99A4B";

    @Column(length = 60)
    private String aula;

    @Column(length = 1000)
    private String descripcion;

    @CreationTimestamp
    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @UpdateTimestamp
    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;

    /** 1:N horarios. Se cargan por lotes (default_batch_fetch_size) para evitar N+1 en listados. */
    @OneToMany(mappedBy = "materia", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("diaSemana ASC, horaInicio ASC")
    private List<HorarioClase> horarios = new ArrayList<>();

    /** Lado inverso de la N:M estudiante-materia. */
    @OneToMany(mappedBy = "materia", fetch = FetchType.LAZY)
    private List<Inscripcion> inscripciones = new ArrayList<>();

    public Long getId() { return id; }
    public PeriodoAcademico getPeriodo() { return periodo; }
    public void setPeriodo(PeriodoAcademico periodo) { this.periodo = periodo; }
    public Usuario getDocente() { return docente; }
    public void setDocente(Usuario docente) { this.docente = docente; }
    public String getCodigoGrupo() { return codigoGrupo; }
    public void setCodigoGrupo(String codigoGrupo) { this.codigoGrupo = codigoGrupo; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public Integer getCreditos() { return creditos; }
    public void setCreditos(Integer creditos) { this.creditos = creditos; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getAula() { return aula; }
    public void setAula(String aula) { this.aula = aula; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
    public LocalDateTime getActualizadoEn() { return actualizadoEn; }
    public List<HorarioClase> getHorarios() { return horarios; }
    public List<Inscripcion> getInscripciones() { return inscripciones; }
}
