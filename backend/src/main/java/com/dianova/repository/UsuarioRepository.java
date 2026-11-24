package com.dianova.repository;

import com.dianova.domain.Enums.RolCodigo;
import com.dianova.domain.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    @Query("select u from Usuario u join fetch u.rol where lower(u.correo) = lower(:correo)")
    Optional<Usuario> buscarPorCorreo(@Param("correo") String correo);

    @Query("select u from Usuario u join fetch u.rol where u.id = :id")
    Optional<Usuario> buscarConRol(@Param("id") Long id);

    boolean existsByCorreoIgnoreCase(String correo);

    boolean existsByCorreoIgnoreCaseAndIdNot(String correo, Long id);

    /** Listado paginado con filtros enviados por la API. El rol viene en el mismo SELECT (sin N+1). */
    @Query(value = """
            select u from Usuario u join fetch u.rol r
            where (:q is null or lower(u.nombre) like :q or lower(u.apellidos) like :q or lower(u.correo) like :q)
              and (:rol is null or r.codigo = :rol)
              and (:activo is null or u.activo = :activo)
            """,
            countQuery = """
            select count(u) from Usuario u join u.rol r
            where (:q is null or lower(u.nombre) like :q or lower(u.apellidos) like :q or lower(u.correo) like :q)
              and (:rol is null or r.codigo = :rol)
              and (:activo is null or u.activo = :activo)
            """)
    Page<Usuario> buscar(@Param("q") String q, @Param("rol") RolCodigo rol, @Param("activo") Boolean activo, Pageable pageable);

    @Query("select count(u) from Usuario u where u.rol.codigo = :rol and u.activo = true")
    long contarActivosPorRol(@Param("rol") RolCodigo rol);
}
