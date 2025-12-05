package es.grupo.apirestCRM.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import es.grupo.apirestCRM.model.Oportunidad;
import es.grupo.apirestCRM.model.Stage;
import es.grupo.apirestCRM.model.Usuario;

public interface OportunidadRepository extends JpaRepository<Oportunidad, String> {

    List<Oportunidad> findByUsuario(Usuario usuario);
    List<Oportunidad> findByUsuarioAndStage(Usuario usuario, Stage stage);

}
