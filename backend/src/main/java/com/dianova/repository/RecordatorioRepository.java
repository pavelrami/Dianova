package com.dianova.repository;

import com.dianova.domain.Enums.CanalNotificacion;
import com.dianova.domain.Enums.EstadoRecordatorio;
import com.dianova.domain.Recordatorio;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RecordatorioRepository extends JpaRepository<Recordatorio, Long> {

    String FILTROS = """
            (:usuarioId is null or u.id = :usuarioId)
              and (:estado is null or r.estado = :estado)
              and (:canal is null or r.canal = :canal)
              and (:q is null or lower(u.nombre) like :q or lower(u.apellidos) like :q or lower(u.correo) like :q
                   or lower(r.mensaje) like :q)
            """;

    @Query(value = "select r from Recordatorio r join fetch r.usuario u left join fetch r.tarea left join fetch r.evento where " + FILTROS,
            countQuery = "select count(r) from Recordatorio r join r.usuario u where " + FILTROS)
    Page<Recordatorio> buscar(@Param("usuarioId") Long usuarioId, @Param("estado") EstadoRecordatorio estado,
                              @Param("canal") CanalNotificacion canal, @Param("q") String q, Pageable pageable);

    @Query("select r from Recordatorio r join fetch r.usuario left join fetch r.tarea left join fetch r.evento where r.id = :id")
    Optional<Recordatorio> buscarDetalle(@Param("id") Long id);

    /** Cola de envío: pendientes cuya hora ya llegó, con todo lo necesario para armar el mensaje. */
    @Query("""
            select r from Recordatorio r join fetch r.usuario left join fetch r.tarea left join fetch r.evento
            where r.estado = :pendiente and r.programadoPara <= :ahora order by r.programadoPara
            """)
    List<Recordatorio> vencidos(@Param("pendiente") EstadoRecordatorio pendiente, @Param("ahora") LocalDateTime ahora,
                                Pageable limite);

    @Query("""
            select count(r) from Recordatorio r
            where r.usuario.id = :usuarioId and r.estado = :estado and r.programadoPara >= :desde and r.programadoPara < :hasta
            """)
    long contarDeUsuarioEnRango(@Param("usuarioId") Long usuarioId, @Param("estado") EstadoRecordatorio estado,
                                @Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);

    long countByEstado(EstadoRecordatorio estado);

    // ----- Limpieza previa a borrar tareas/eventos (la FK de recordatorios es RESTRICT, ver V1) -----

    @Modifying
    @Query("delete from Recordatorio r where r.tarea.id = :tareaId")
    int borrarDeTarea(@Param("tareaId") Long tareaId);

    @Modifying
    @Query("delete from Recordatorio r where r.evento.id = :eventoId")
    int borrarDeEvento(@Param("eventoId") Long eventoId);

    @Modifying
    @Query("""
            delete from Recordatorio r
            where r.tarea.id in (select t.id from Tarea t where t.materia.id = :materiaId)
               or r.evento.id in (select e.id from Evento e where e.materia.id = :materiaId)
            """)
    int borrarDeMateria(@Param("materiaId") Long materiaId);

    @Modifying
    @Query("""
            delete from Recordatorio r
            where r.tarea.id in (select t.id from Tarea t where t.creador.id = :usuarioId)
               or r.evento.id in (select e.id from Evento e where e.creador.id = :usuarioId)
            """)
    int borrarDeContenidoCreadoPor(@Param("usuarioId") Long usuarioId);
}
