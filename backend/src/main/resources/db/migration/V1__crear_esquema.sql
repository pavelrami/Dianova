-- =====================================================================
-- Dianova · V1 · Esquema inicial (MySQL 8.0.16+)
-- 14 tablas en 3FN. Relaciones N:M resueltas con entidades asociativas:
--   estudiante <-> materia  : inscripciones
--   estudiante <-> tarea    : seguimientos_tarea
--   usuario    <-> evento   : participaciones_evento
-- Nota MySQL: una columna usada en un CHECK no puede tener ON DELETE/UPDATE
-- en su FK; por eso recordatorios.id_tarea / id_evento usan RESTRICT y el
-- servicio borra los recordatorios antes de borrar una tarea o un evento.
-- =====================================================================

CREATE TABLE roles (
    id_rol       BIGINT       NOT NULL AUTO_INCREMENT,
    codigo       VARCHAR(20)  NOT NULL,
    nombre       VARCHAR(60)  NOT NULL,
    descripcion  VARCHAR(255) NULL,
    PRIMARY KEY (id_rol),
    CONSTRAINT uq_roles_codigo UNIQUE (codigo),
    CONSTRAINT ck_roles_codigo CHECK (codigo IN ('ADMIN', 'DOCENTE', 'ESTUDIANTE'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE usuarios (
    id_usuario      BIGINT       NOT NULL AUTO_INCREMENT,
    id_rol          BIGINT       NOT NULL,
    nombre          VARCHAR(80)  NOT NULL,
    apellidos       VARCHAR(120) NOT NULL,
    correo          VARCHAR(160) NOT NULL,
    password_hash   VARCHAR(100) NOT NULL,
    telefono        VARCHAR(20)  NULL,
    carrera         VARCHAR(120) NULL,
    avatar_url      VARCHAR(500) NULL,
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    ultimo_acceso   DATETIME(6)  NULL,
    creado_en       DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    actualizado_en  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id_usuario),
    -- utf8mb4_0900_ai_ci: el correo es único sin distinguir mayúsculas
    CONSTRAINT uq_usuarios_correo UNIQUE (correo),
    CONSTRAINT fk_usuarios_rol FOREIGN KEY (id_rol) REFERENCES roles (id_rol),
    CONSTRAINT ck_usuarios_telefono CHECK (telefono IS NULL OR telefono REGEXP '^\\+[1-9][0-9]{7,14}$')
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE periodos_academicos (
    id_periodo    BIGINT      NOT NULL AUTO_INCREMENT,
    nombre        VARCHAR(40) NOT NULL,
    fecha_inicio  DATE        NOT NULL,
    fecha_fin     DATE        NOT NULL,
    activo        BOOLEAN     NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id_periodo),
    CONSTRAINT uq_periodos_nombre UNIQUE (nombre),
    CONSTRAINT ck_periodos_rango CHECK (fecha_fin > fecha_inicio)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE materias (
    id_materia      BIGINT        NOT NULL AUTO_INCREMENT,
    id_periodo      BIGINT        NOT NULL,
    id_docente      BIGINT        NULL,
    codigo_grupo    VARCHAR(20)   NOT NULL,
    nombre          VARCHAR(120)  NOT NULL,
    creditos        INT           NOT NULL,
    color           VARCHAR(7)    NOT NULL DEFAULT '#C99A4B',
    aula            VARCHAR(60)   NULL,
    descripcion     VARCHAR(1000) NULL,
    creado_en       DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    actualizado_en  DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id_materia),
    CONSTRAINT uq_materias_periodo_grupo UNIQUE (id_periodo, codigo_grupo),
    CONSTRAINT fk_materias_periodo FOREIGN KEY (id_periodo) REFERENCES periodos_academicos (id_periodo),
    CONSTRAINT fk_materias_docente FOREIGN KEY (id_docente) REFERENCES usuarios (id_usuario) ON DELETE SET NULL,
    CONSTRAINT ck_materias_creditos CHECK (creditos BETWEEN 1 AND 20),
    CONSTRAINT ck_materias_color CHECK (color REGEXP '^#[0-9A-Fa-f]{6}$')
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE inscripciones (
    id_inscripcion     BIGINT      NOT NULL AUTO_INCREMENT,
    id_estudiante      BIGINT      NOT NULL,
    id_materia         BIGINT      NOT NULL,
    fecha_inscripcion  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    estado             VARCHAR(12) NOT NULL DEFAULT 'ACTIVA',
    PRIMARY KEY (id_inscripcion),
    CONSTRAINT uq_inscripciones_estudiante_materia UNIQUE (id_estudiante, id_materia),
    CONSTRAINT fk_inscripciones_estudiante FOREIGN KEY (id_estudiante) REFERENCES usuarios (id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_inscripciones_materia FOREIGN KEY (id_materia) REFERENCES materias (id_materia) ON DELETE CASCADE,
    CONSTRAINT ck_inscripciones_estado CHECK (estado IN ('ACTIVA', 'BAJA', 'FINALIZADA'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE horarios_clase (
    id_horario   BIGINT      NOT NULL AUTO_INCREMENT,
    id_materia   BIGINT      NOT NULL,
    dia_semana   INT         NOT NULL,
    hora_inicio  TIME        NOT NULL,
    hora_fin     TIME        NOT NULL,
    aula         VARCHAR(60) NULL,
    PRIMARY KEY (id_horario),
    CONSTRAINT fk_horarios_materia FOREIGN KEY (id_materia) REFERENCES materias (id_materia) ON DELETE CASCADE,
    -- 1 = lunes ... 7 = domingo (ISO-8601)
    CONSTRAINT ck_horarios_dia CHECK (dia_semana BETWEEN 1 AND 7),
    CONSTRAINT ck_horarios_rango CHECK (hora_fin > hora_inicio)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE tareas (
    id_tarea            BIGINT        NOT NULL AUTO_INCREMENT,
    id_creador          BIGINT        NOT NULL,
    id_materia          BIGINT        NULL,
    titulo              VARCHAR(150)  NOT NULL,
    descripcion         VARCHAR(2000) NULL,
    fecha_entrega       DATETIME(6)   NOT NULL,
    prioridad           VARCHAR(10)   NOT NULL DEFAULT 'MEDIA',
    origen              VARCHAR(10)   NOT NULL,
    estado_publicacion  VARCHAR(12)   NOT NULL DEFAULT 'PUBLICADA',
    publicada_en        DATETIME(6)   NULL,
    creado_en           DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    actualizado_en      DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id_tarea),
    CONSTRAINT fk_tareas_creador FOREIGN KEY (id_creador) REFERENCES usuarios (id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_tareas_materia FOREIGN KEY (id_materia) REFERENCES materias (id_materia) ON DELETE CASCADE,
    CONSTRAINT ck_tareas_prioridad CHECK (prioridad IN ('ALTA', 'MEDIA', 'BAJA')),
    CONSTRAINT ck_tareas_origen CHECK (origen IN ('PERSONAL', 'DOCENTE')),
    CONSTRAINT ck_tareas_publicacion CHECK (estado_publicacion IN ('BORRADOR', 'PUBLICADA')),
    INDEX ix_tareas_entrega (fecha_entrega)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE seguimientos_tarea (
    id_seguimiento  BIGINT      NOT NULL AUTO_INCREMENT,
    id_tarea        BIGINT      NOT NULL,
    id_estudiante   BIGINT      NOT NULL,
    estado          VARCHAR(12) NOT NULL DEFAULT 'PENDIENTE',
    completada_en   DATETIME(6) NULL,
    actualizado_en  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id_seguimiento),
    CONSTRAINT uq_seguimientos_tarea_estudiante UNIQUE (id_tarea, id_estudiante),
    CONSTRAINT fk_seguimientos_tarea FOREIGN KEY (id_tarea) REFERENCES tareas (id_tarea) ON DELETE CASCADE,
    CONSTRAINT fk_seguimientos_estudiante FOREIGN KEY (id_estudiante) REFERENCES usuarios (id_usuario) ON DELETE CASCADE,
    CONSTRAINT ck_seguimientos_estado CHECK (estado IN ('PENDIENTE', 'EN_PROCESO', 'COMPLETADA')),
    CONSTRAINT ck_seguimientos_completada CHECK (estado <> 'COMPLETADA' OR completada_en IS NOT NULL)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE eventos (
    id_evento       BIGINT        NOT NULL AUTO_INCREMENT,
    id_creador      BIGINT        NOT NULL,
    id_materia      BIGINT        NULL,
    titulo          VARCHAR(150)  NOT NULL,
    descripcion     VARCHAR(2000) NULL,
    ubicacion       VARCHAR(150)  NULL,
    inicio          DATETIME(6)   NOT NULL,
    fin             DATETIME(6)   NOT NULL,
    tipo            VARCHAR(12)   NOT NULL,
    estado          VARCHAR(12)   NOT NULL DEFAULT 'PROGRAMADO',
    creado_en       DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    actualizado_en  DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id_evento),
    CONSTRAINT fk_eventos_creador FOREIGN KEY (id_creador) REFERENCES usuarios (id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_eventos_materia FOREIGN KEY (id_materia) REFERENCES materias (id_materia) ON DELETE CASCADE,
    CONSTRAINT ck_eventos_tipo CHECK (tipo IN ('CLASE', 'EXAMEN', 'ENTREGA', 'TALLER', 'ESTUDIO', 'ASESORIA', 'SOCIAL', 'PERSONAL')),
    CONSTRAINT ck_eventos_estado CHECK (estado IN ('PROGRAMADO', 'CANCELADO', 'FINALIZADO')),
    CONSTRAINT ck_eventos_rango CHECK (fin > inicio),
    INDEX ix_eventos_inicio (inicio)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE participaciones_evento (
    id_participacion  BIGINT      NOT NULL AUTO_INCREMENT,
    id_evento         BIGINT      NOT NULL,
    id_usuario        BIGINT      NOT NULL,
    respuesta         VARCHAR(12) NOT NULL DEFAULT 'PENDIENTE',
    asistio           BOOLEAN     NULL,
    respondido_en     DATETIME(6) NULL,
    PRIMARY KEY (id_participacion),
    CONSTRAINT uq_participaciones_evento_usuario UNIQUE (id_evento, id_usuario),
    CONSTRAINT fk_participaciones_evento FOREIGN KEY (id_evento) REFERENCES eventos (id_evento) ON DELETE CASCADE,
    CONSTRAINT fk_participaciones_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE CASCADE,
    CONSTRAINT ck_participaciones_respuesta CHECK (respuesta IN ('PENDIENTE', 'CONFIRMADA', 'RECHAZADA'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE preferencias_notificacion (
    id_usuario            BIGINT      NOT NULL,
    email_habilitado      BOOLEAN     NOT NULL DEFAULT TRUE,
    sms_habilitado        BOOLEAN     NOT NULL DEFAULT FALSE,
    whatsapp_habilitado   BOOLEAN     NOT NULL DEFAULT FALSE,
    minutos_anticipacion  INT         NOT NULL DEFAULT 60,
    consentimiento_en     DATETIME(6) NULL,
    actualizado_en        DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id_usuario),
    CONSTRAINT fk_preferencias_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE CASCADE,
    CONSTRAINT ck_preferencias_anticipacion CHECK (minutos_anticipacion BETWEEN 5 AND 10080)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE recordatorios (
    id_recordatorio  BIGINT       NOT NULL AUTO_INCREMENT,
    id_usuario       BIGINT       NOT NULL,
    id_tarea         BIGINT       NULL,
    id_evento        BIGINT       NULL,
    canal            VARCHAR(10)  NOT NULL,
    programado_para  DATETIME(6)  NOT NULL,
    mensaje          VARCHAR(500) NULL,
    estado           VARCHAR(12)  NOT NULL DEFAULT 'PENDIENTE',
    intentos         INT          NOT NULL DEFAULT 0,
    enviado_en       DATETIME(6)  NULL,
    detalle_error    VARCHAR(500) NULL,
    creado_en        DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id_recordatorio),
    CONSTRAINT fk_recordatorios_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_recordatorios_tarea FOREIGN KEY (id_tarea) REFERENCES tareas (id_tarea),
    CONSTRAINT fk_recordatorios_evento FOREIGN KEY (id_evento) REFERENCES eventos (id_evento),
    CONSTRAINT ck_recordatorios_canal CHECK (canal IN ('EMAIL', 'SMS', 'WHATSAPP')),
    CONSTRAINT ck_recordatorios_estado CHECK (estado IN ('PENDIENTE', 'ENVIADO', 'FALLIDO', 'CANCELADO')),
    -- exactamente una tarea o un evento, nunca ambos
    CONSTRAINT ck_recordatorios_destino CHECK ((id_tarea IS NULL) <> (id_evento IS NULL)),
    INDEX ix_recordatorios_cola (estado, programado_para)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE sesiones_jwt (
    id_sesion    BIGINT       NOT NULL AUTO_INCREMENT,
    id_usuario   BIGINT       NOT NULL,
    jti_hash     VARCHAR(64)  NOT NULL,
    emitida_en   DATETIME(6)  NOT NULL,
    expira_en    DATETIME(6)  NOT NULL,
    revocada_en  DATETIME(6)  NULL,
    ip           VARCHAR(45)  NULL,
    user_agent   VARCHAR(255) NULL,
    PRIMARY KEY (id_sesion),
    CONSTRAINT uq_sesiones_jti UNIQUE (jti_hash),
    CONSTRAINT fk_sesiones_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE tokens_recuperacion (
    id_token    BIGINT      NOT NULL AUTO_INCREMENT,
    id_usuario  BIGINT      NOT NULL,
    token_hash  VARCHAR(64) NOT NULL,
    expira_en   DATETIME(6) NOT NULL,
    usado_en    DATETIME(6) NULL,
    creado_en   DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id_token),
    CONSTRAINT uq_tokens_hash UNIQUE (token_hash),
    CONSTRAINT fk_tokens_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
