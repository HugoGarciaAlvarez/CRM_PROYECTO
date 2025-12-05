package es.grupo.apirestCRM.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import es.grupo.apirestCRM.model.Contacto;

public interface ContactoRepository extends JpaRepository<Contacto, Long> {

}
