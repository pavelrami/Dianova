-- =====================================================================
-- Dianova · 10 consultas de estudio sobre el modelo (MySQL 8)
-- Corresponden a la tabla de la sección 6 del documento de modelado.
-- =====================================================================

-- 01 Estudiantes activos
SELECT u.id_usuario, CONCAT(u.nombre, ' ', u.apellidos) AS estudiante, u.correo
FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol
WHERE r.codigo = 'ESTUDIANTE' AND u.activo = TRUE
ORDER BY u.apellidos;

-- 02 Docentes y sus materias
SELECT CONCAT(d.nombre, ' ', d.apellidos) AS docente, m.codigo_grupo, m.nombre AS materia
FROM usuarios d JOIN materias m ON m.id_docente = d.id_usuario
ORDER BY docente, m.nombre;

-- 03 Materias de un estudiante (N:M a través de inscripciones)
SELECT m.codigo_grupo, m.nombre, i.estado, i.fecha_inscripcion
FROM inscripciones i JOIN materias m ON m.id_materia = i.id_materia
WHERE i.id_estudiante = 7;

-- 04 Tareas pendientes de un estudiante (N:M a través de seguimientos_tarea)
SELECT t.titulo, t.fecha_entrega, t.prioridad, s.estado
FROM seguimientos_tarea s JOIN tareas t ON t.id_tarea = s.id_tarea
WHERE s.id_estudiante = 7 AND s.estado <> 'COMPLETADA' AND t.estado_publicacion = 'PUBLICADA'
ORDER BY t.fecha_entrega;

-- 05 Actividades publicadas por docentes
SELECT t.titulo, m.nombre AS materia, CONCAT(u.nombre, ' ', u.apellidos) AS docente, t.publicada_en
FROM tareas t JOIN materias m ON m.id_materia = t.id_materia JOIN usuarios u ON u.id_usuario = t.id_creador
WHERE t.origen = 'DOCENTE' AND t.estado_publicacion = 'PUBLICADA';

-- 06 Inscritos por materia
SELECT m.nombre, COUNT(i.id_inscripcion) AS inscritos
FROM materias m LEFT JOIN inscripciones i ON i.id_materia = m.id_materia AND i.estado = 'ACTIVA'
GROUP BY m.id_materia, m.nombre
ORDER BY inscritos DESC;

-- 07 Eventos de las materias en que está inscrito un estudiante
SELECT e.titulo, e.tipo, e.inicio, m.nombre AS materia
FROM eventos e JOIN materias m ON m.id_materia = e.id_materia
JOIN inscripciones i ON i.id_materia = m.id_materia
WHERE i.id_estudiante = 7 AND i.estado = 'ACTIVA' AND e.inicio >= NOW()
ORDER BY e.inicio;

-- 08 Recordatorios pendientes de envío
SELECT r.id_recordatorio, r.canal, r.programado_para, u.correo
FROM recordatorios r JOIN usuarios u ON u.id_usuario = r.id_usuario
WHERE r.estado = 'PENDIENTE' AND r.programado_para <= NOW() + INTERVAL 1 DAY
ORDER BY r.programado_para;

-- 09 Materias del periodo activo
SELECT p.nombre AS periodo, m.codigo_grupo, m.nombre, m.creditos
FROM materias m JOIN periodos_academicos p ON p.id_periodo = m.id_periodo
WHERE p.activo = TRUE;

-- 10 Tareas completadas por estudiante
SELECT CONCAT(u.nombre, ' ', u.apellidos) AS estudiante, COUNT(*) AS completadas
FROM seguimientos_tarea s JOIN usuarios u ON u.id_usuario = s.id_estudiante
WHERE s.estado = 'COMPLETADA'
GROUP BY u.id_usuario, estudiante
ORDER BY completadas DESC;

-- 11 Códigos de verificación vigentes (sin usar y sin vencer) por propósito y canal
SELECT proposito, canal, COUNT(*) AS vigentes
FROM codigos_verificacion
WHERE usado_en IS NULL AND expira_en > NOW()
GROUP BY proposito, canal;

-- 12 Solicitudes de recuperación de contraseña en los últimos 7 días, por canal
SELECT DATE(c.creado_en) AS dia, c.canal, COUNT(*) AS solicitudes,
       SUM(c.usado_en IS NOT NULL AND c.intentos < 5) AS verificadas
FROM codigos_verificacion c
WHERE c.proposito = 'RECUPERACION' AND c.creado_en >= NOW() - INTERVAL 7 DAY
GROUP BY dia, c.canal
ORDER BY dia DESC;

-- 13 Cuentas sin correo verificado (las crea el administrador)
SELECT u.id_usuario, u.correo, r.codigo AS rol, u.creado_en
FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol
WHERE u.correo_verificado_en IS NULL
ORDER BY u.creado_en DESC;
