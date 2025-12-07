package es.grupo.apirestCRM.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import es.grupo.apirestCRM.model.Cliente;
import es.grupo.apirestCRM.model.Usuario;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
     List<Cliente> findTop5ByUsuarioOrderByIdClienteDesc(Usuario usuario);

     List<Cliente> findByUsuarioId(Long idUsuario);

     Optional<Cliente> findByIdClienteAndUsuarioId(Long idCliente, Long idUsuario);
}
