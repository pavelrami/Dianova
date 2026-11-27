package com.dianova.security;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/** SHA-256 / HMAC para guardar JTI, tokens y códigos sin poder reconstruirlos desde la BD. */
public final class Hashes {

    private static final SecureRandom RANDOM = new SecureRandom();

    private Hashes() {
    }

    public static String sha256(String valor) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(valor.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 no disponible", e);
        }
    }

    /** Token aleatorio seguro para URLs (32 bytes). */
    public static String tokenAleatorio() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /**
     * HMAC-SHA256 con una clave del servidor. Se usa para los códigos de 6 dígitos: con SHA-256 simple
     * bastaría probar el millón de combinaciones para revertir un hash robado de la BD.
     */
    public static String hmacSha256(String clave, String valor) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(clave.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(valor.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("HMAC-SHA256 no disponible", e);
        }
    }

    /** Código numérico aleatorio con ceros a la izquierda, por ejemplo "048213". */
    public static String codigoNumerico(int digitos) {
        int max = (int) Math.pow(10, digitos);
        return String.format("%0" + digitos + "d", RANDOM.nextInt(max));
    }
}
