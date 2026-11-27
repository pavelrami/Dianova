-- =====================================================================
-- Dianova · V3 · Códigos de verificación de un solo uso
--   REGISTRO     : confirma que el correo es del estudiante antes de crear
--                  la cuenta (todavía no existe id_usuario).
--   RECUPERACION : código por correo o SMS para restablecer la contraseña.
--                  Al validarlo se emite un token en tokens_recuperacion.
-- Solo se guarda el hash del código (HMAC-SHA256), nunca el código.
-- =====================================================================

ALTER TABLE usuarios
    ADD COLUMN correo_verificado_en DATETIME(6) NULL AFTER correo;

-- Las cuentas existentes se dan por verificadas (se crearon antes de este flujo)
UPDATE usuarios SET correo_verificado_en = creado_en WHERE correo_verificado_en IS NULL;

CREATE TABLE codigos_verificacion (
    id_codigo    BIGINT      NOT NULL AUTO_INCREMENT,
    id_usuario   BIGINT      NULL,
    proposito    VARCHAR(12) NOT NULL,
    canal        VARCHAR(10) NOT NULL,
    -- correo o teléfono (E.164) al que se envió el código
    destino      VARCHAR(160) NOT NULL,
    codigo_hash  VARCHAR(64) NOT NULL,
    intentos     INT         NOT NULL DEFAULT 0,
    expira_en    DATETIME(6) NOT NULL,
    usado_en     DATETIME(6) NULL,
    ip           VARCHAR(45) NULL,
    creado_en    DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id_codigo),
    CONSTRAINT fk_codigos_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE CASCADE,
    CONSTRAINT ck_codigos_proposito CHECK (proposito IN ('REGISTRO', 'RECUPERACION')),
    CONSTRAINT ck_codigos_canal CHECK (canal IN ('EMAIL', 'SMS')),
    -- el registro siempre se confirma por correo
    CONSTRAINT ck_codigos_registro_email CHECK (proposito <> 'REGISTRO' OR canal = 'EMAIL'),
    CONSTRAINT ck_codigos_intentos CHECK (intentos BETWEEN 0 AND 10),
    CONSTRAINT ck_codigos_expira CHECK (expira_en > creado_en),
    INDEX ix_codigos_destino (proposito, destino, creado_en),
    INDEX ix_codigos_usuario (id_usuario, proposito, creado_en)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
