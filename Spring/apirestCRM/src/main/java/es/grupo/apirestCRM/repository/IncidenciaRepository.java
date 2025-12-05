package es.grupo.apirestCRM.repository;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import es.grupo.apirestCRM.model.Incidencia;

import es.grupo.apirestCRM.model.Usuario;

public interface IncidenciaRepository extends JpaRepository<Incidencia, Long> {
      int countByEstado(String estado);

     List<Incidencia> findByClienteUsuario(Usuario usuario);
}
