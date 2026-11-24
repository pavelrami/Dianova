package com.dianova.domain;

import com.dianova.domain.Enums.RespuestaParticipacion;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/** Entidad asociativa de la relación N:M USUARIO &lt;-&gt; EVENTO (invitación, respuesta y asistencia). */
@Entity
@Table(name = "participaciones_evento",
        uniqueConstraints = @UniqueConstraint(name = "uq_participaciones_evento_usuario", columnNames = {"id_evento", "id_usuario"}))
public class ParticipacionEvento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_participacion")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_evento", nullable = false)
    private Evento evento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 12)
    private RespuestaParticipacion respuesta = RespuestaParticipacion.PENDIENTE;

    private Boolean asistio;

    @Column(name = "respondido_en")
    private LocalDateTime respondidoEn;

    public ParticipacionEvento() {
    }

    public ParticipacionEvento(Evento evento, Usuario usuario) {
        this.evento = evento;
        this.usuario = usuario;
    }

    public Long getId() { return id; }
    public Evento getEvento() { return evento; }
    public void setEvento(Evento evento) { this.evento = evento; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public RespuestaParticipacion getRespuesta() { return respuesta; }
    public void setRespuesta(RespuestaParticipacion respuesta) { this.respuesta = respuesta; }
    public Boolean getAsistio() { return asistio; }
    public void setAsistio(Boolean asistio) { this.asistio = asistio; }
    public LocalDateTime getRespondidoEn() { return respondidoEn; }
    public void setRespondidoEn(LocalDateTime respondidoEn) { this.respondidoEn = respondidoEn; }
}
