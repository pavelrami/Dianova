package com.dianova.service;

import com.dianova.config.DianovaProperties;
import com.dianova.domain.CodigoVerificacion;
import com.dianova.domain.Enums.CanalNotificacion;
import com.dianova.domain.Enums.PropositoCodigo;
import com.dianova.domain.Usuario;
import com.dianova.exception.LimiteExcedidoException;
import com.dianova.exception.ReglaNegocioException;
import com.dianova.repository.CodigoVerificacionRepository;
import com.dianova.security.Hashes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Códigos de 6 dígitos de un solo uso. Reglas:
 * vencen en 10 minutos · máximo 5 intentos · 60 s entre envíos · máximo 5 envíos por hora.
 * Un intento fallido debe guardarse aunque la petición responda error, por eso
 * ReglaNegocioException no revierte la transacción.
 */
@Service
@Transactional(noRollbackFor = ReglaNegocioException.class)
public class CodigoVerificacionService {

    private static final Logger log = LoggerFactory.getLogger(CodigoVerificacionService.class);

    public static final int DIGITOS = 6;
    public static final long MINUTOS_VIGENCIA = 10;
    public static final int MAX_INTENTOS = 5;
    public static final long SEGUNDOS_ENTRE_ENVIOS = 60;
    public static final int MAX_ENVIOS_POR_HORA = 5;

    private final CodigoVerificacionRepository codigos;
    private final DianovaProperties props;

    public CodigoVerificacionService(CodigoVerificacionRepository codigos, DianovaProperties props) {
        this.codigos = codigos;
        this.props = props;
    }

    // ------------------------------------------------------------------ registro (todavía no hay usuario)

    /** Devuelve el código en claro para enviarlo. Lanza 429 si se pidió hace muy poco. */
    public String emitirRegistro(String correo, String ip) {
        LocalDateTime ahora = LocalDateTime.now();
        exigirLimite(codigos.findFirstByPropositoAndDestinoAndUsuarioIsNullOrderByCreadoEnDesc(PropositoCodigo.REGISTRO, correo),
                codigos.contarPorDestino(PropositoCodigo.REGISTRO, correo, ahora.minusHours(1)), ahora);
        codigos.invalidarPorDestino(PropositoCodigo.REGISTRO, correo, ahora);
        return crear(null, PropositoCodigo.REGISTRO, CanalNotificacion.EMAIL, correo, ip, ahora);
    }

    public void validarRegistro(String correo, String codigo) {
        comprobar(codigos.findFirstByPropositoAndDestinoAndUsuarioIsNullOrderByCreadoEnDesc(PropositoCodigo.REGISTRO, correo),
                PropositoCodigo.REGISTRO, codigo);
    }

    // ------------------------------------------------------------------ recuperación de contraseña

    /**
     * Devuelve el código en claro, o vacío si se pidió hace muy poco. En recuperación no se responde 429:
     * eso revelaría que la cuenta existe.
     */
    public Optional<String> emitirRecuperacion(Usuario u, CanalNotificacion canal, String destino, String ip) {
        LocalDateTime ahora = LocalDateTime.now();
        try {
            exigirLimite(codigos.findFirstByPropositoAndUsuarioIdOrderByCreadoEnDesc(PropositoCodigo.RECUPERACION, u.getId()),
                    codigos.contarPorUsuario(PropositoCodigo.RECUPERACION, u.getId(), ahora.minusHours(1)), ahora);
        } catch (LimiteExcedidoException e) {
            log.info("Código de recuperación para el usuario {} no emitido: {}", u.getId(), e.getMessage());
            return Optional.empty();
        }
        codigos.invalidarPorUsuario(PropositoCodigo.RECUPERACION, u.getId(), ahora);
        return Optional.of(crear(u, PropositoCodigo.RECUPERACION, canal, destino, ip, ahora));
    }

    public void validarRecuperacion(Usuario u, String codigo) {
        comprobar(codigos.findFirstByPropositoAndUsuarioIdOrderByCreadoEnDesc(PropositoCodigo.RECUPERACION, u.getId()),
                PropositoCodigo.RECUPERACION, codigo);
    }

    /** Error idéntico para "no existe", "venció" o "no coincide": no da pistas. */
    public static ReglaNegocioException codigoInvalido(String detalle) {
        return ReglaNegocioException.campo("codigo", detalle == null ? "El código no es válido o ya expiró. Solicita uno nuevo" : detalle);
    }

    // ------------------------------------------------------------------ internos

    private void exigirLimite(Optional<CodigoVerificacion> ultimo, long enLaUltimaHora, LocalDateTime ahora) {
        if (ultimo.isPresent()) {
            long transcurridos = Duration.between(ultimo.get().getCreadoEn(), ahora).toSeconds();
            if (transcurridos < SEGUNDOS_ENTRE_ENVIOS) {
                long espera = SEGUNDOS_ENTRE_ENVIOS - transcurridos;
                throw new LimiteExcedidoException("Espera " + espera + " segundos para pedir otro código", espera);
            }
        }
        if (enLaUltimaHora >= MAX_ENVIOS_POR_HORA) {
            throw new LimiteExcedidoException("Pediste demasiados códigos. Intenta de nuevo en una hora", 3600);
        }
    }

    private String crear(Usuario u, PropositoCodigo proposito, CanalNotificacion canal, String destino, String ip, LocalDateTime ahora) {
        String codigo = Hashes.codigoNumerico(DIGITOS);
        CodigoVerificacion c = new CodigoVerificacion();
        c.setUsuario(u);
        c.setProposito(proposito);
        c.setCanal(canal);
        c.setDestino(destino);
        c.setCodigoHash(hash(proposito, destino, codigo));
        c.setExpiraEn(ahora.plusMinutes(MINUTOS_VIGENCIA));
        c.setIp(ip);
        codigos.save(c);
        return codigo;
    }

    private void comprobar(Optional<CodigoVerificacion> encontrado, PropositoCodigo proposito, String codigo) {
        LocalDateTime ahora = LocalDateTime.now();
        CodigoVerificacion c = encontrado.filter(x -> x.esVigente(ahora)).orElseThrow(() -> codigoInvalido(null));
        String esperado = c.getCodigoHash();
        String recibido = hash(proposito, c.getDestino(), codigo == null ? "" : codigo.trim());
        if (!MessageDigest.isEqual(esperado.getBytes(StandardCharsets.UTF_8), recibido.getBytes(StandardCharsets.UTF_8))) {
            c.setIntentos(c.getIntentos() + 1);
            int restantes = MAX_INTENTOS - c.getIntentos();
            if (restantes <= 0) {
                c.setUsadoEn(ahora);
                throw codigoInvalido("Agotaste los intentos. Solicita un código nuevo");
            }
            throw codigoInvalido("El código no coincide. Te " + (restantes == 1 ? "queda 1 intento" : "quedan " + restantes + " intentos"));
        }
        c.setUsadoEn(ahora);
    }

    private String hash(PropositoCodigo proposito, String destino, String codigo) {
        return Hashes.hmacSha256(props.jwt().secreto(), proposito.name() + ":" + destino + ":" + codigo);
    }

    /** Limpieza diaria de códigos vencidos hace más de un día. */
    @Scheduled(cron = "0 40 3 * * *")
    public void limpiarVencidos() {
        int n = codigos.borrarVencidos(LocalDateTime.now().minusDays(1));
        log.info("Códigos de verificación vencidos eliminados: {}", n);
    }
}
