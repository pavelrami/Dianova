package com.dianova.domain;

import com.dianova.domain.Enums.CanalNotificacion;
import com.dianova.domain.Enums.EstadoRecordatorio;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * Programación e historial de un envío por correo, SMS o WhatsApp.
 * Se asocia exactamente a una tarea o a un evento (CHECK XOR en la BD).
 */
@Entity
@Table(name = "recordatorios")
public class Recordatorio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_recordatorio")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tarea")
    private Tarea tarea;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_evento")
    private Evento evento;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 10)
    private CanalNotificacion canal;

    @Column(name = "programado_para", nullable = false)
    private LocalDateTime programadoPara;

    @Column(length = 500)
    private String mensaje;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 12)
    private EstadoRecordatorio estado = EstadoRecordatorio.PENDIENTE;

    @Column(nullable = false)
    private Integer intentos = 0;

    @Column(name = "enviado_en")
    private LocalDateTime enviadoEn;

    @Column(name = "detalle_error", length = 500)
    private String detalleError;

    @CreationTimestamp
    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    public void marcarEnviado() {
        this.estado = EstadoRecordatorio.ENVIADO;
        this.enviadoEn = LocalDateTime.now();
        this.detalleError = null;
        this.intentos = intentos + 1;
    }

    public void registrarFallo(String detalle, int maxIntentos, int minutosReintento) {
        this.intentos = intentos + 1;
        this.detalleError = detalle == null ? null : detalle.substring(0, Math.min(detalle.length(), 500));
        if (intentos >= maxIntentos) {
            this.estado = EstadoRecordatorio.FALLIDO;
        } else {
            this.programadoPara = LocalDateTime.now().plusMinutes(minutosReintento);
        }
    }

    public Long getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public Tarea getTarea() { return tarea; }
    public void setTarea(Tarea tarea) { this.tarea = tarea; }
    public Evento getEvento() { return evento; }
    public void setEvento(Evento evento) { this.evento = evento; }
    public CanalNotificacion getCanal() { return canal; }
    public void setCanal(CanalNotificacion canal) { this.canal = canal; }
    public LocalDateTime getProgramadoPara() { return programadoPara; }
    public void setProgramadoPara(LocalDateTime programadoPara) { this.programadoPara = programadoPara; }
    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
    public EstadoRecordatorio getEstado() { return estado; }
    public void setEstado(EstadoRecordatorio estado) { this.estado = estado; }
    public Integer getIntentos() { return intentos; }
    public void setIntentos(Integer intentos) { this.intentos = intentos; }
    public LocalDateTime getEnviadoEn() { return enviadoEn; }
    public void setEnviadoEn(LocalDateTime enviadoEn) { this.enviadoEn = enviadoEn; }
    public String getDetalleError() { return detalleError; }
    public void setDetalleError(String detalleError) { this.detalleError = detalleError; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
}
