package es.grupo.apirestCRM.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import es.grupo.apirestCRM.model.Rol;



public interface RolRepository extends JpaRepository<Rol, Long> {
    Optional<Rol> findByName(String name);
}