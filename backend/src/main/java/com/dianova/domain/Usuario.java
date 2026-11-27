package com.dianova.domain;

import com.dianova.domain.Enums.RolCodigo;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long id;

    /** Muchos usuarios comparten un rol. LAZY + JOIN FETCH en las consultas que lo necesitan. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_rol", nullable = false)
    private Rol rol;

    @Column(nullable = false, length = 80)
    private String nombre;

    @Column(nullable = false, length = 120)
    private String apellidos;

    @Column(nullable = false, unique = true, length = 160)
    private String correo;

    /** Cuándo confirmó el correo con un código. Las cuentas que crea el admin quedan en null. */
    @Column(name = "correo_verificado_en")
    private LocalDateTime correoVerificadoEn;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(length = 20)
    private String telefono;

    @Column(length = 120)
    private String carrera;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(name = "ultimo_acceso")
    private LocalDateTime ultimoAcceso;

    @CreationTimestamp
    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @UpdateTimestamp
    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;

    /** Lado inverso 1:N (materias que imparte como docente). */
    @OneToMany(mappedBy = "docente", fetch = FetchType.LAZY)
    private List<Materia> materiasImpartidas = new ArrayList<>();

    /** Lado inverso de la N:M estudiante-materia (entidad asociativa Inscripcion). */
    @OneToMany(mappedBy = "estudiante", fetch = FetchType.LAZY)
    private List<Inscripcion> inscripciones = new ArrayList<>();

    public String getNombreCompleto() {
        return nombre + " " + apellidos;
    }

    public boolean tieneRol(RolCodigo codigo) {
        return rol != null && rol.getCodigo() == codigo;
    }

    public Long getId() { return id; }
    public Rol getRol() { return rol; }
    public void setRol(Rol rol) { this.rol = rol; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    public LocalDateTime getCorreoVerificadoEn() { return correoVerificadoEn; }
    public void setCorreoVerificadoEn(LocalDateTime correoVerificadoEn) { this.correoVerificadoEn = correoVerificadoEn; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getCarrera() { return carrera; }
    public void setCarrera(String carrera) { this.carrera = carrera; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
    public LocalDateTime getUltimoAcceso() { return ultimoAcceso; }
    public void setUltimoAcceso(LocalDateTime ultimoAcceso) { this.ultimoAcceso = ultimoAcceso; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
    public LocalDateTime getActualizadoEn() { return actualizadoEn; }
    public List<Materia> getMateriasImpartidas() { return materiasImpartidas; }
    public List<Inscripcion> getInscripciones() { return inscripciones; }
}
