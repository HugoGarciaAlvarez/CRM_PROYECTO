package es.grupo.apirestCRM.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import es.grupo.apirestCRM.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsername(String username);
    Optional<Usuario> findByEmail(String email);
}