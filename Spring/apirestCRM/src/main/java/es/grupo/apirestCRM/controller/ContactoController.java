package es.grupo.apirestCRM.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.grupo.apirestCRM.dto.ContactoDTO;
import es.grupo.apirestCRM.service.ContactoService;

@RestController
@RequestMapping("/contactos")
public class ContactoController {

    @Autowired
    private ContactoService contactoService;

    @GetMapping
    public List<ContactoDTO> listarContactos() {
        return contactoService.listarContactos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactoDTO> obtenerContacto(@PathVariable Long id) {
        return contactoService.obtenerContactoPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ContactoDTO crearContacto(@RequestBody ContactoDTO dto) {
        return contactoService.crearContacto(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactoDTO> actualizarContacto(@PathVariable Long id, @RequestBody ContactoDTO dto) {
        try {
            return ResponseEntity.ok(contactoService.actualizarContacto(id, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarContacto(@PathVariable Long id) {
        contactoService.eliminarContacto(id);
        return ResponseEntity.noContent().build();
    }
}