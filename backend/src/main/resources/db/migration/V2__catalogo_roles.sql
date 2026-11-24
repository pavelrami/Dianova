-- =====================================================================
-- Dianova · V2 · Catálogo base de roles (se carga en todos los perfiles)
-- Los datos de demostración (usuarios, materias, tareas...) los carga
-- DemoDataSeeder (CommandLineRunner) solo con el perfil "demo".
-- =====================================================================

INSERT INTO roles (codigo, nombre, descripcion) VALUES
    ('ADMIN',      'Administrador', 'Acceso total: gestión de usuarios y CRUD de todos los módulos'),
    ('DOCENTE',    'Docente',       'Publica tareas y eventos de sus materias y consulta a sus inscritos'),
    ('ESTUDIANTE', 'Estudiante',    'Gestiona sus tareas, calendario, eventos y recordatorios');
