package com.dianova.domain;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/** Sesión emitida con JWT. Guarda el hash del JTI para poder revocarla (logout). */
@Entity
@Table(name = "sesiones_jwt")
public class SesionJwt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sesion")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "jti_hash", nullable = false, unique = true, length = 64)
    private String jtiHash;

    @Column(name = "emitida_en", nullable = false)
    private LocalDateTime emitidaEn;

    @Column(name = "expira_en", nullable = false)
    private LocalDateTime expiraEn;

    @Column(name = "revocada_en")
    private LocalDateTime revocadaEn;

    @Column(length = 45)
    private String ip;

    @Column(name = "user_agent", length = 255)
    private String userAgent;

    public boolean estaVigente() {
        return revocadaEn == null && expiraEn.isAfter(LocalDateTime.now());
    }

    public Long getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public String getJtiHash() { return jtiHash; }
    public void setJtiHash(String jtiHash) { this.jtiHash = jtiHash; }
    public LocalDateTime getEmitidaEn() { return emitidaEn; }
    public void setEmitidaEn(LocalDateTime emitidaEn) { this.emitidaEn = emitidaEn; }
    public LocalDateTime getExpiraEn() { return expiraEn; }
    public void setExpiraEn(LocalDateTime expiraEn) { this.expiraEn = expiraEn; }
    public LocalDateTime getRevocadaEn() { return revocadaEn; }
    public void setRevocadaEn(LocalDateTime revocadaEn) { this.revocadaEn = revocadaEn; }
    public String getIp() { return ip; }
    public void setIp(String ip) { this.ip = ip; }
    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
}
