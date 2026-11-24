package com.dianova.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/** Consentimiento y canales de comunicación de cada usuario (1:0..1 con Usuario, PK compartida). */
@Entity
@Table(name = "preferencias_notificacion")
public class PreferenciaNotificacion {

    @Id
    @Column(name = "id_usuario")
    private Long id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @Column(name = "email_habilitado", nullable = false)
    private boolean emailHabilitado = true;

    @Column(name = "sms_habilitado", nullable = false)
    private boolean smsHabilitado;

    @Column(name = "whatsapp_habilitado", nullable = false)
    private boolean whatsappHabilitado;

    @Column(name = "minutos_anticipacion", nullable = false)
    private Integer minutosAnticipacion = 60;

    @Column(name = "consentimiento_en")
    private LocalDateTime consentimientoEn;

    @UpdateTimestamp
    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;

    public PreferenciaNotificacion() {
    }

    public PreferenciaNotificacion(Usuario usuario) {
        this.usuario = usuario;
    }

    public Long getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public boolean isEmailHabilitado() { return emailHabilitado; }
    public void setEmailHabilitado(boolean emailHabilitado) { this.emailHabilitado = emailHabilitado; }
    public boolean isSmsHabilitado() { return smsHabilitado; }
    public void setSmsHabilitado(boolean smsHabilitado) { this.smsHabilitado = smsHabilitado; }
    public boolean isWhatsappHabilitado() { return whatsappHabilitado; }
    public void setWhatsappHabilitado(boolean whatsappHabilitado) { this.whatsappHabilitado = whatsappHabilitado; }
    public Integer getMinutosAnticipacion() { return minutosAnticipacion; }
    public void setMinutosAnticipacion(Integer minutosAnticipacion) { this.minutosAnticipacion = minutosAnticipacion; }
    public LocalDateTime getConsentimientoEn() { return consentimientoEn; }
    public void setConsentimientoEn(LocalDateTime consentimientoEn) { this.consentimientoEn = consentimientoEn; }
    public LocalDateTime getActualizadoEn() { return actualizadoEn; }
}
