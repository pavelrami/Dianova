package com.dianova.domain;

import com.dianova.domain.Enums.CanalNotificacion;
import com.dianova.domain.Enums.PropositoCodigo;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/** Código de 6 dígitos de un solo uso (registro o recuperación). Solo se guarda su hash. */
@Entity
@Table(name = "codigos_verificacion")
public class CodigoVerificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_codigo")
    private Long id;

    /** Null en REGISTRO: la cuenta todavía no existe. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 12)
    private PropositoCodigo proposito;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private CanalNotificacion canal;

    @Column(nullable = false, length = 160)
    private String destino;

    @Column(name = "codigo_hash", nullable = false, length = 64)
    private String codigoHash;

    @Column(nullable = false)
    private int intentos;

    @Column(name = "expira_en", nullable = false)
    private LocalDateTime expiraEn;

    @Column(name = "usado_en")
    private LocalDateTime usadoEn;

    @Column(length = 45)
    private String ip;

    @CreationTimestamp
    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    public boolean esVigente(LocalDateTime ahora) {
        return usadoEn == null && expiraEn.isAfter(ahora);
    }

    public Long getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public PropositoCodigo getProposito() { return proposito; }
    public void setProposito(PropositoCodigo proposito) { this.proposito = proposito; }
    public CanalNotificacion getCanal() { return canal; }
    public void setCanal(CanalNotificacion canal) { this.canal = canal; }
    public String getDestino() { return destino; }
    public void setDestino(String destino) { this.destino = destino; }
    public String getCodigoHash() { return codigoHash; }
    public void setCodigoHash(String codigoHash) { this.codigoHash = codigoHash; }
    public int getIntentos() { return intentos; }
    public void setIntentos(int intentos) { this.intentos = intentos; }
    public LocalDateTime getExpiraEn() { return expiraEn; }
    public void setExpiraEn(LocalDateTime expiraEn) { this.expiraEn = expiraEn; }
    public LocalDateTime getUsadoEn() { return usadoEn; }
    public void setUsadoEn(LocalDateTime usadoEn) { this.usadoEn = usadoEn; }
    public String getIp() { return ip; }
    public void setIp(String ip) { this.ip = ip; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
}
