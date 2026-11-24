package com.dianova.repository;

import com.dianova.domain.PreferenciaNotificacion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PreferenciaRepository extends JpaRepository<PreferenciaNotificacion, Long> {
}
