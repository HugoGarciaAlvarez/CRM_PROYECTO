package es.grupo.apirestCRM.repository;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import es.grupo.apirestCRM.model.Tarea;
import es.grupo.apirestCRM.model.Usuario;

public interface TareaRepository extends JpaRepository<Tarea, Long> {
    List<Tarea> findByUsuarioOrderByFechaVencimientoDesc(Usuario usuario);

    List<Tarea> findByUsuario(Usuario usuario);

    List<Tarea> findByUsuarioId(Long idUsuario);
}
