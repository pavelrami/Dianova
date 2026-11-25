package com.dianova.seed;

import com.dianova.domain.*;
import com.dianova.domain.Enums.*;
import com.dianova.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

/**
 * Datos de demostración (solo con el perfil "demo" y solo si la tabla usuarios está vacía).
 * Las fechas se calculan desde hoy para que el panel, el calendario y las entregas siempre se vean vigentes.
 * No envía ningún mensaje: los recordatorios se guardan directo en la BD y los correos usan el dominio
 * reservado ".test", que el despachador nunca envía.
 *
 * Credenciales (también en el README):
 *   admin@dianova.test      / Admin#2026       (ADMIN)
 *   docente@dianova.test    / Docente#2026     (DOCENTE)
 *   estudiante@dianova.test / Estudiante#2026  (ESTUDIANTE)
 */
@Component
@Profile("demo")
public class DemoDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    private final UsuarioRepository usuarios;
    private final RolRepository roles;
    private final PeriodoRepository periodos;
    private final MateriaRepository materias;
    private final HorarioRepository horarios;
    private final InscripcionRepository inscripciones;
    private final TareaRepository tareas;
    private final SeguimientoRepository seguimientos;
    private final EventoRepository eventos;
    private final ParticipacionRepository participaciones;
    private final PreferenciaRepository preferencias;
    private final RecordatorioRepository recordatorios;
    private final PasswordEncoder encoder;

    private final Random rnd = new Random(2026);

    public DemoDataSeeder(UsuarioRepository usuarios, RolRepository roles, PeriodoRepository periodos,
                          MateriaRepository materias, HorarioRepository horarios, InscripcionRepository inscripciones,
                          TareaRepository tareas, SeguimientoRepository seguimientos, EventoRepository eventos,
                          ParticipacionRepository participaciones, PreferenciaRepository preferencias,
                          RecordatorioRepository recordatorios, PasswordEncoder encoder) {
        this.usuarios = usuarios;
        this.roles = roles;
        this.periodos = periodos;
        this.materias = materias;
        this.horarios = horarios;
        this.inscripciones = inscripciones;
        this.tareas = tareas;
        this.seguimientos = seguimientos;
        this.eventos = eventos;
        this.participaciones = participaciones;
        this.preferencias = preferencias;
        this.recordatorios = recordatorios;
        this.encoder = encoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (usuarios.count() > 0) {
            log.info("DemoDataSeeder: la base ya tiene usuarios, no se cargan datos de demostración");
            return;
        }
        log.info("DemoDataSeeder: cargando datos de demostración...");
        LocalDate hoy = LocalDate.now();
        LocalDateTime ahora = LocalDateTime.now();
        LocalDate lunes = hoy.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        // ------------------------------------------------------------------ usuarios (1 admin, 5 docentes, 14 estudiantes)
        Rol rAdmin = roles.findByCodigo(RolCodigo.ADMIN).orElseThrow();
        Rol rDocente = roles.findByCodigo(RolCodigo.DOCENTE).orElseThrow();
        Rol rEstudiante = roles.findByCodigo(RolCodigo.ESTUDIANTE).orElseThrow();
        String hAdmin = encoder.encode("Admin#2026");
        String hDocente = encoder.encode("Docente#2026");
        String hEstudiante = encoder.encode("Estudiante#2026");

        Usuario admin = usuario(rAdmin, "Administración", "Dianova", "admin@dianova.test", hAdmin, null);

        String[][] docs = {
                {"Alejandro", "Méndez Ruiz", "docente@dianova.test"},
                {"Elena", "Santos Ibarra", "esantos@dianova.test"},
                {"Roberto", "Castillo Peña", "rcastillo@dianova.test"},
                {"Carmen", "Silva Robles", "csilva@dianova.test"},
                {"Daniel", "Ortega Luna", "dortega@dianova.test"}};
        List<Usuario> docentes = new ArrayList<>();
        for (String[] d : docs) docentes.add(usuario(rDocente, d[0], d[1], d[2], hDocente, null));

        String[][] ests = {
                {"Sofía", "Martínez López", "estudiante@dianova.test", "Ingeniería en Software"},
                {"Diego", "Hernández Cruz", "dhernandez@dianova.test", "Ingeniería en Software"},
                {"Valeria", "Gómez Torres", "vgomez@dianova.test", "Ingeniería en Software"},
                {"Mateo", "Ramírez Vega", "mramirez@dianova.test", "Ingeniería Mecatrónica"},
                {"Camila", "Flores Rivas", "cflores@dianova.test", "Ingeniería en Software"},
                {"Santiago", "Morales Díaz", "smorales@dianova.test", "Ingeniería Industrial"},
                {"Regina", "Navarro Soto", "rnavarro@dianova.test", "Ingeniería en Software"},
                {"Emiliano", "Reyes Campos", "ereyes@dianova.test", "Ingeniería Mecatrónica"},
                {"Ximena", "Aguilar Mora", "xaguilar@dianova.test", "Ingeniería en Software"},
                {"Leonardo", "Castro Ortiz", "lcastro@dianova.test", "Ingeniería Industrial"},
                {"Renata", "Jiménez Salas", "rjimenez@dianova.test", "Ingeniería en Software"},
                {"Sebastián", "Vargas Luna", "svargas@dianova.test", "Ingeniería Mecatrónica"},
                {"Fernanda", "Rojas Medina", "frojas@dianova.test", "Ingeniería en Software"},
                {"Andrés", "Guerrero Paz", "aguerrero@dianova.test", "Ingeniería Industrial"}};
        List<Usuario> estudiantes = new ArrayList<>();
        for (String[] e : ests) estudiantes.add(usuario(rEstudiante, e[0], e[1], e[2], hEstudiante, e[3]));
        Usuario sofia = estudiantes.getFirst();

        List<Usuario> todos = new ArrayList<>();
        todos.add(admin);
        todos.addAll(docentes);
        todos.addAll(estudiantes);
        for (Usuario u : todos) {
            u.setUltimoAcceso(ahora.minusHours(rnd.nextInt(72)));
            PreferenciaNotificacion p = new PreferenciaNotificacion(u);
            p.setMinutosAnticipacion(u == sofia ? 120 : 60);
            p.setConsentimientoEn(ahora.minusDays(10));
            preferencias.save(p);
        }

        // ------------------------------------------------------------------ periodos
        int anio = hoy.getYear();
        boolean segundoSemestre = hoy.getMonthValue() >= 7;
        PeriodoAcademico anterior = periodo(segundoSemestre ? anio + "-1" : (anio - 1) + "-2",
                segundoSemestre ? LocalDate.of(anio, 1, 19) : LocalDate.of(anio - 1, 8, 10),
                segundoSemestre ? LocalDate.of(anio, 6, 12) : LocalDate.of(anio - 1, 12, 18), false);
        PeriodoAcademico actual = periodo(anio + (segundoSemestre ? "-2" : "-1"),
                hoy.minusWeeks(14), hoy.plusWeeks(5), true);
        periodo(segundoSemestre ? (anio + 1) + "-1" : anio + "-2",
                hoy.plusWeeks(9), hoy.plusWeeks(29), false);
        // Historial: ocho semestres anteriores al "anterior" (catálogo con 11 periodos)
        int anioHist = segundoSemestre ? anio : anio - 1;
        int semHist = segundoSemestre ? 1 : 2;
        for (int k = 0; k < 8; k++) {
            if (semHist == 1) {
                anioHist--;
                semHist = 2;
            } else {
                semHist = 1;
            }
            periodo(anioHist + "-" + semHist,
                    semHist == 1 ? LocalDate.of(anioHist, 1, 19) : LocalDate.of(anioHist, 8, 10),
                    semHist == 1 ? LocalDate.of(anioHist, 6, 12) : LocalDate.of(anioHist, 12, 18), false);
        }

        // ------------------------------------------------------------------ materias + horarios
        Object[][] mats = {
                // código, nombre, créditos, color, aula, docente, {día, hh:mm inicio, hh:mm fin}...
                {"MAT-301", "Cálculo Vectorial", 6, "#C99A4B", "Aula 204", 0, new String[]{"1 08:30 10:00", "3 08:30 10:00"}},
                {"FIS-302", "Física General III", 6, "#8FAF8B", "Lab. de Física 2", 1, new String[]{"2 09:00 11:00", "4 10:00 12:00"}},
                {"MAT-303", "Álgebra Lineal", 5, "#9A5530", "Aula 108", 2, new String[]{"1 14:00 15:30", "3 14:00 15:30"}},
                {"ING-304", "Metodologías Ágiles", 4, "#D9A441", "Cubículo 5", 3, new String[]{"5 11:00 12:30"}},
                {"ING-305", "Diseño de Interfaces UX/UI", 4, "#7A1F1F", "Laboratorio 4", 4, new String[]{"5 08:30 10:30"}},
                {"HUM-201", "Ética y Sociedad", 3, "#B9A48A", "Aula 12", 3, new String[]{"2 12:00 13:30"}},
                {"PRG-310", "Programación Web", 6, "#B5653B", "Lab. de Cómputo 2", 4, new String[]{"2 16:00 18:00", "4 16:00 18:00"}},
                {"BDD-320", "Bases de Datos", 6, "#6B4A3A", "Lab. de Cómputo 1", 2, new String[]{"1 11:00 13:00", "3 11:00 13:00"}},
                {"EST-210", "Probabilidad y Estadística", 5, "#7F8A4E", "Aula 106", 0, new String[]{"2 07:00 08:30", "4 07:00 08:30"}},
                {"RED-330", "Redes de Computadoras", 5, "#5F7F7A", "Lab. de Redes", 1, new String[]{"5 13:00 15:00"}},
                {"SIS-340", "Sistemas Operativos", 5, "#7B4B5E", "Aula 210", 4, new String[]{"1 16:00 17:30", "3 16:00 17:30"}},
                {"ING-350", "Ingeniería de Software", 6, "#C47A6B", "Aula 301", 3, new String[]{"4 12:30 14:30"}}};
        List<Materia> lista = new ArrayList<>();
        for (Object[] m : mats) {
            Materia x = new Materia();
            x.setPeriodo(actual);
            x.setCodigoGrupo((String) m[0] + "-A");
            x.setNombre((String) m[1]);
            x.setCreditos((Integer) m[2]);
            x.setColor((String) m[3]);
            x.setAula((String) m[4]);
            x.setDocente(docentes.get((Integer) m[5]));
            x.setDescripcion("Curso del periodo " + actual.getNombre() + " impartido por " + docentes.get((Integer) m[5]).getNombreCompleto() + ".");
            materias.save(x);
            for (String h : (String[]) m[6]) {
                String[] p = h.split(" ");
                HorarioClase hc = new HorarioClase();
                hc.setMateria(x);
                hc.setDiaSemana(Integer.parseInt(p[0]));
                hc.setHoraInicio(LocalTime.parse(p[1]));
                hc.setHoraFin(LocalTime.parse(p[2]));
                hc.setAula((String) m[4]);
                horarios.save(hc);
            }
            lista.add(x);
        }
        // Dos materias del periodo anterior (historial)
        Materia hist1 = materiaSimple(anterior, "MAT-201-A", "Cálculo Diferencial", 6, "#C99A4B", docentes.get(0));
        materiaSimple(anterior, "PRG-110-A", "Fundamentos de Programación", 6, "#B5653B", docentes.get(4));

        // ------------------------------------------------------------------ inscripciones (N:M)
        Map<Materia, List<Usuario>> inscritos = new LinkedHashMap<>();
        lista.forEach(m -> inscritos.put(m, new ArrayList<>()));
        // Sofía: las seis materias de los mockups
        for (int i : new int[]{0, 1, 2, 3, 4, 5}) inscribir(sofia, lista.get(i), inscritos, ahora.minusWeeks(14));
        for (int e = 1; e < estudiantes.size(); e++) {
            List<Integer> idx = new ArrayList<>(List.of(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11));
            Collections.shuffle(idx, rnd);
            int n = 4 + rnd.nextInt(3);
            for (int k = 0; k < n; k++) inscribir(estudiantes.get(e), lista.get(idx.get(k)), inscritos, ahora.minusWeeks(14));
        }
        Inscripcion baja = inscripciones.findByEstudianteIdAndMateriaId(estudiantes.get(5).getId(),
                inscritos.entrySet().stream().filter(en -> en.getValue().contains(estudiantes.get(5))).findFirst().orElseThrow().getKey().getId()).orElseThrow();
        baja.setEstado(EstadoInscripcion.BAJA);
        inscritos.values().forEach(l -> l.remove(estudiantes.get(5)));
        Inscripcion fin = new Inscripcion();
        fin.setEstudiante(sofia);
        fin.setMateria(hist1);
        fin.setEstado(EstadoInscripcion.FINALIZADA);
        fin.setFechaInscripcion(ahora.minusMonths(10));
        inscripciones.save(fin);

        // ------------------------------------------------------------------ tareas de docente (2 por materia) + seguimientos
        String[][] titulos = {
                {"Entrega de reporte: integrales de línea", "Ejercicios de campos vectoriales"},
                {"Reporte de laboratorio: inducción", "Problemario de óptica"},
                {"Ejercicios de matrices y determinantes", "Proyecto: transformaciones lineales"},
                {"Retrospectiva del sprint 3", "Tablero Kanban del proyecto"},
                {"Proyecto final: prototipo navegable", "Pruebas de usabilidad con 5 usuarios"},
                {"Ensayo de ética profesional", "Análisis de caso: privacidad de datos"},
                {"Landing responsiva con React", "Consumo de API REST con Axios"},
                {"Modelo entidad-relación", "Normalización hasta 3FN"},
                {"Práctica de distribuciones", "Examen de práctica: intervalos de confianza"},
                {"Configuración de VLANs", "Análisis de tráfico con Wireshark"},
                {"Simulación de planificador de procesos", "Reporte de memoria virtual"},
                {"Historias de usuario del proyecto", "Diagrama de despliegue"}};
        int[][] desfases = {{0, 3}, {1, 6}, {3, 9}, {-3, 4}, {0, 12}, {-1, 5}, {2, 8}, {-5, 7}, {4, 10}, {-2, 11}, {6, 13}, {1, 15}};
        Prioridad[] prios = Prioridad.values();
        List<Tarea> publicadas = new ArrayList<>();
        for (int i = 0; i < lista.size(); i++) {
            Materia m = lista.get(i);
            for (int j = 0; j < 2; j++) {
                Tarea t = new Tarea();
                t.setCreador(m.getDocente());
                t.setMateria(m);
                t.setTitulo(titulos[i][j]);
                t.setDescripcion("Actividad de " + m.getNombre() + ". Revisa las instrucciones en clase y entrega en la plataforma.");
                t.setFechaEntrega(hoy.plusDays(desfases[i][j]).atTime(j == 0 ? 23 : 18, j == 0 ? 59 : 0));
                t.setPrioridad(prios[(i + j) % 3]);
                t.setOrigen(OrigenTarea.DOCENTE);
                boolean borrador = (i == 6 || i == 10) && j == 1;
                t.setEstadoPublicacion(borrador ? EstadoPublicacion.BORRADOR : EstadoPublicacion.PUBLICADA);
                t.setPublicadaEn(borrador ? null : ahora.minusDays(7 + rnd.nextInt(5)));
                tareas.save(t);
                if (!borrador) {
                    publicadas.add(t);
                    for (Usuario e : inscritos.get(m)) {
                        SeguimientoTarea s = new SeguimientoTarea(t, e);
                        double r = rnd.nextDouble();
                        boolean vencida = t.getFechaEntrega().isBefore(ahora);
                        if (vencida ? r < 0.85 : r < 0.3) {
                            s.setEstado(EstadoSeguimiento.COMPLETADA);
                            s.setCompletadaEn(vencida ? t.getFechaEntrega().minusHours(2 + rnd.nextInt(30)) : ahora.minusHours(rnd.nextInt(48) + 1));
                        } else if (r < (vencida ? 0.95 : 0.6)) {
                            s.setEstado(EstadoSeguimiento.EN_PROCESO);
                        }
                        seguimientos.save(s);
                    }
                }
            }
        }
        // Tareas personales (con su seguimiento para el propio estudiante)
        personal(sofia, null, "Preparación de exposición", hoy.plusDays(4).atTime(9, 0), Prioridad.MEDIA, EstadoSeguimiento.PENDIENTE);
        personal(sofia, lista.get(1), "Repasar notas para el examen parcial", hoy.plusDays(2).atTime(20, 0), Prioridad.ALTA, EstadoSeguimiento.EN_PROCESO);
        personal(sofia, null, "Renovar credencial de la biblioteca", hoy.minusDays(1).atTime(13, 0), Prioridad.BAJA, EstadoSeguimiento.COMPLETADA);
        personal(sofia, lista.get(4), "Investigar referencias de diseño", hoy.plusDays(6).atTime(18, 0), Prioridad.BAJA, EstadoSeguimiento.PENDIENTE);
        personal(estudiantes.get(1), null, "Comprar material de laboratorio", hoy.plusDays(3).atTime(10, 0), Prioridad.MEDIA, EstadoSeguimiento.PENDIENTE);
        personal(estudiantes.get(2), null, "Organizar apuntes del parcial", hoy.plusDays(1).atTime(19, 0), Prioridad.ALTA, EstadoSeguimiento.EN_PROCESO);

        // ------------------------------------------------------------------ eventos + participaciones (N:M)
        evento(docentes.get(1), lista.get(1), "Examen parcial de Física III", "Temas: inducción, circuitos RLC y óptica geométrica.",
                "Aula Magna", lunes.plusDays(3).atTime(16, 0), 90, TipoEvento.EXAMEN, inscritos);
        evento(docentes.get(4), lista.get(4), "Taller de prototipado en Figma", "Componentes, variantes y auto-layout para el proyecto final.",
                "Laboratorio de Cómputo 4", hoy.atTime(16, 0), 120, TipoEvento.TALLER, inscritos);
        evento(docentes.get(1), lista.get(1), "Repaso general: electromagnetismo", "Sesión grupal para resolver la guía del parcial.",
                "Biblioteca Central, sala B", hoy.plusDays(1).atTime(15, 30), 120, TipoEvento.ESTUDIO, inscritos);
        evento(docentes.get(0), lista.get(0), "Asesoría de Cálculo Vectorial", "Dudas sobre la entrega de integrales de línea.",
                "Cubículo Prof. Méndez", hoy.plusDays(8).atTime(12, 0), 60, TipoEvento.ASESORIA, inscritos);
        evento(docentes.get(3), lista.get(3), "Demo del sprint 3", "Cada equipo presenta su incremento.",
                "Cubículo 5", hoy.plusDays(4).atTime(11, 0), 90, TipoEvento.ENTREGA, inscritos);
        evento(docentes.get(2), lista.get(7), "Examen de Bases de Datos", "Modelo E-R, normalización y SQL.",
                "Lab. de Cómputo 1", hoy.plusDays(9).atTime(11, 0), 120, TipoEvento.EXAMEN, inscritos);
        evento(docentes.get(4), lista.get(6), "Code review de proyectos web", "Revisión en parejas de los repositorios.",
                "Lab. de Cómputo 2", hoy.minusDays(3).atTime(16, 0), 120, TipoEvento.TALLER, inscritos);
        evento(docentes.get(3), lista.get(5), "Debate: ética e inteligencia artificial", "Lectura previa obligatoria.",
                "Aula 12", hoy.plusDays(6).atTime(12, 0), 90, TipoEvento.CLASE, inscritos);
        evento(docentes.get(0), lista.get(8), "Examen de Probabilidad", "Unidades 3 y 4.",
                "Aula 106", hoy.plusDays(11).atTime(7, 0), 90, TipoEvento.EXAMEN, inscritos);
        evento(docentes.get(1), lista.get(9), "Práctica de cableado estructurado", "Traer pinzas y cable UTP.",
                "Lab. de Redes", hoy.plusDays(2).atTime(13, 0), 120, TipoEvento.TALLER, inscritos);
        evento(admin, null, "Feria de Proyectos de Innovación", "Exposición abierta a toda la comunidad.",
                "Explanada principal", hoy.plusDays(7).atTime(9, 0), 360, TipoEvento.SOCIAL, inscritos);
        evento(admin, null, "Conferencia: IA aplicada en ingeniería", "Ponencia magistral de investigadores invitados.",
                "Auditorio principal", hoy.plusDays(3).atTime(11, 0), 120, TipoEvento.SOCIAL, inscritos);
        evento(sofia, null, "Reunión de equipo: proyecto final UX", "Definir el flujo del prototipo.",
                "Cubículo 3, biblioteca", hoy.plusDays(4).atTime(16, 0), 60, TipoEvento.PERSONAL, inscritos);
        evento(sofia, null, "Cita con tutora académica", null,
                "Coordinación de Ingeniería", hoy.plusDays(5).atTime(10, 0), 30, TipoEvento.PERSONAL, inscritos);
        evento(estudiantes.get(1), null, "Estudio en grupo de Álgebra", null,
                "Biblioteca", hoy.plusDays(2).atTime(18, 0), 90, TipoEvento.ESTUDIO, inscritos);

        // ------------------------------------------------------------------ recordatorios (historial; no se envía nada)
        List<Tarea> deSofia = publicadas.stream().filter(t -> inscritos.get(t.getMateria()).contains(sofia)).toList();
        List<Evento> evSofia = eventos.findAll().stream()
                .filter(e -> e.getMateria() != null && inscritos.get(e.getMateria()).contains(sofia)).toList();
        for (int i = 0; i < 8 && i < deSofia.size(); i++) {
            Tarea t = deSofia.get(i);
            boolean pasado = t.getFechaEntrega().isBefore(ahora.plusHours(3));
            recordatorio(sofia, t, null, i % 3 == 0 ? CanalNotificacion.WHATSAPP : CanalNotificacion.EMAIL,
                    pasado ? t.getFechaEntrega().minusHours(2) : t.getFechaEntrega().minusHours(2),
                    pasado ? (i % 3 == 0 ? EstadoRecordatorio.FALLIDO : EstadoRecordatorio.ENVIADO) : EstadoRecordatorio.PENDIENTE);
        }
        for (int i = 0; i < 3 && i < evSofia.size(); i++) {
            Evento e = evSofia.get(i);
            recordatorio(sofia, null, e, CanalNotificacion.EMAIL, e.getInicio().minusHours(1),
                    e.getInicio().isBefore(ahora) ? EstadoRecordatorio.ENVIADO : EstadoRecordatorio.PENDIENTE);
        }
        for (int i = 1; i <= 5; i++) {
            Usuario e = estudiantes.get(i);
            Tarea t = publicadas.stream().filter(x -> inscritos.get(x.getMateria()).contains(e)).findFirst().orElse(null);
            if (t != null) {
                recordatorio(e, t, null, i % 2 == 0 ? CanalNotificacion.SMS : CanalNotificacion.EMAIL, ahora.minusDays(i),
                        i == 3 ? EstadoRecordatorio.CANCELADO : EstadoRecordatorio.ENVIADO);
            }
        }
        log.info("DemoDataSeeder: {} usuarios, {} materias, {} tareas, {} eventos, {} recordatorios",
                usuarios.count(), materias.count(), tareas.count(), eventos.count(), recordatorios.count());
    }

    // ------------------------------------------------------------------ ayudantes

    private Usuario usuario(Rol rol, String nombre, String apellidos, String correo, String hash, String carrera) {
        Usuario u = new Usuario();
        u.setRol(rol);
        u.setNombre(nombre);
        u.setApellidos(apellidos);
        u.setCorreo(correo);
        u.setPasswordHash(hash);
        u.setCarrera(carrera);
        return usuarios.save(u);
    }

    private PeriodoAcademico periodo(String nombre, LocalDate ini, LocalDate fin, boolean activo) {
        PeriodoAcademico p = new PeriodoAcademico();
        p.setNombre(nombre);
        p.setFechaInicio(ini);
        p.setFechaFin(fin);
        p.setActivo(activo);
        return periodos.save(p);
    }

    private Materia materiaSimple(PeriodoAcademico p, String codigo, String nombre, int creditos, String color, Usuario docente) {
        Materia m = new Materia();
        m.setPeriodo(p);
        m.setCodigoGrupo(codigo);
        m.setNombre(nombre);
        m.setCreditos(creditos);
        m.setColor(color);
        m.setDocente(docente);
        return materias.save(m);
    }

    private void inscribir(Usuario e, Materia m, Map<Materia, List<Usuario>> inscritos, LocalDateTime cuando) {
        Inscripcion i = new Inscripcion();
        i.setEstudiante(e);
        i.setMateria(m);
        i.setFechaInscripcion(cuando.plusHours(rnd.nextInt(72)));
        inscripciones.save(i);
        inscritos.get(m).add(e);
    }

    private void personal(Usuario e, Materia m, String titulo, LocalDateTime entrega, Prioridad p, EstadoSeguimiento estado) {
        Tarea t = new Tarea();
        t.setCreador(e);
        t.setMateria(m);
        t.setTitulo(titulo);
        t.setFechaEntrega(entrega);
        t.setPrioridad(p);
        t.setOrigen(OrigenTarea.PERSONAL);
        t.setEstadoPublicacion(EstadoPublicacion.PUBLICADA);
        t.setPublicadaEn(LocalDateTime.now().minusDays(2));
        tareas.save(t);
        SeguimientoTarea s = new SeguimientoTarea(t, e);
        s.setEstado(estado);
        if (estado == EstadoSeguimiento.COMPLETADA) s.setCompletadaEn(entrega.minusHours(3));
        seguimientos.save(s);
    }

    private void evento(Usuario creador, Materia m, String titulo, String desc, String lugar, LocalDateTime inicio,
                        int minutos, TipoEvento tipo, Map<Materia, List<Usuario>> inscritos) {
        Evento e = new Evento();
        e.setCreador(creador);
        e.setMateria(m);
        e.setTitulo(titulo);
        e.setDescripcion(desc);
        e.setUbicacion(lugar);
        e.setInicio(inicio);
        e.setFin(inicio.plusMinutes(minutos));
        e.setTipo(tipo);
        e.setEstado(inicio.plusMinutes(minutos).isBefore(LocalDateTime.now()) ? EstadoEvento.FINALIZADO : EstadoEvento.PROGRAMADO);
        eventos.save(e);
        if (m != null) {
            for (Usuario u : inscritos.get(m)) {
                ParticipacionEvento p = new ParticipacionEvento(e, u);
                double r = rnd.nextDouble();
                if (r < 0.55) {
                    p.setRespuesta(RespuestaParticipacion.CONFIRMADA);
                    p.setRespondidoEn(LocalDateTime.now().minusHours(rnd.nextInt(60) + 1));
                } else if (r < 0.7) {
                    p.setRespuesta(RespuestaParticipacion.RECHAZADA);
                    p.setRespondidoEn(LocalDateTime.now().minusHours(rnd.nextInt(60) + 1));
                }
                if (e.getEstado() == EstadoEvento.FINALIZADO) p.setAsistio(rnd.nextDouble() < 0.8);
                participaciones.save(p);
            }
        }
    }

    private void recordatorio(Usuario u, Tarea t, Evento e, CanalNotificacion canal, LocalDateTime cuando, EstadoRecordatorio estado) {
        Recordatorio r = new Recordatorio();
        r.setUsuario(u);
        r.setTarea(t);
        r.setEvento(e);
        r.setCanal(canal);
        r.setProgramadoPara(cuando);
        r.setEstado(estado);
        if (estado == EstadoRecordatorio.ENVIADO) {
            r.setIntentos(1);
            r.setEnviadoEn(cuando);
        } else if (estado == EstadoRecordatorio.FALLIDO) {
            r.setIntentos(3);
            r.setDetalleError("Twilio respondió 400: el número no se ha unido al sandbox de WhatsApp");
        }
        recordatorios.save(r);
    }
}
