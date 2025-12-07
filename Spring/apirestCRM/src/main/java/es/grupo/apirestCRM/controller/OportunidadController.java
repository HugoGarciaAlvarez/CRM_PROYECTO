package es.grupo.apirestCRM.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.grupo.apirestCRM.dto.OportunidadDTO;
import es.grupo.apirestCRM.service.OportunidadService;

@RestController
@RequestMapping("/oportunidades")
public class OportunidadController {

    @Autowired
    private OportunidadService oportunidadService;

    // Obtener todas las oportunidades
    @GetMapping
    public ResponseEntity<List<OportunidadDTO>> getAllOportunidades() {
        List<OportunidadDTO> oportunidades = oportunidadService.findAll();
        return ResponseEntity.ok(oportunidades);
    }

    // Obtener una oportunidad por ID
    @GetMapping("/{id}")
    public ResponseEntity<OportunidadDTO> getOportunidadById(@PathVariable String id) {
        return oportunidadService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Crear una nueva oportunidad
    @PostMapping
    public ResponseEntity<OportunidadDTO> createOportunidad(@RequestBody OportunidadDTO oportunidadDTO) {
        OportunidadDTO createdOportunidad = oportunidadService.save(oportunidadDTO);
        return new ResponseEntity<>(createdOportunidad, HttpStatus.CREATED);
    }

    // Actualizar una oportunidad existente
    @PutMapping("/{id}")
    public ResponseEntity<OportunidadDTO> updateOportunidad(@PathVariable String id, @RequestBody OportunidadDTO oportunidadDTO) {
        try {
            OportunidadDTO updatedOportunidad = oportunidadService.update(id, oportunidadDTO);
            return ResponseEntity.ok(updatedOportunidad);
        } catch (RuntimeException e) {
            // Manejar errores de Cliente/Usuario no encontrado (lanzados en el Service)
            return ResponseEntity.badRequest().body(null); 
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Eliminar una oportunidad
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOportunidad(@PathVariable String id) {
        oportunidadService.delete(id);
        return ResponseEntity.noContent().build();
    }
}