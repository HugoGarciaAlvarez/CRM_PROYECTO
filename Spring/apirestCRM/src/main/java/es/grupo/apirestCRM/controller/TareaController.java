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

import es.grupo.apirestCRM.dto.TareaDTO;

import es.grupo.apirestCRM.service.TareaService;

// TareaController.java
// (Importaciones omitidas por brevedad)

@RestController
@RequestMapping("/api/tareas")
public class TareaController {

    @Autowired
    private TareaService tareaService;

    // ------------------------------------
    // ENDPOINTS CRUD
    // ------------------------------------

    /** GET /api/tareas : Obtener todas las tareas (lista) */
    @GetMapping
    public ResponseEntity<List<TareaDTO>> getAllTareas() {
        List<TareaDTO> tareas = tareaService.obtenerTodasLasTareas();
        return ResponseEntity.ok(tareas);
    }

    /** GET /api/tareas/{id} : Obtener una tarea por ID */
    @GetMapping("/{id}")
    public ResponseEntity<TareaDTO> getTareaById(@PathVariable Long id) {
        return ResponseEntity.ok(tareaService.obtenerTareaPorId(id));
    }

    /** POST /api/tareas : Crear una nueva tarea */
    @PostMapping
    public ResponseEntity<TareaDTO> createTarea(@RequestBody TareaDTO dto) {
        TareaDTO newTarea = tareaService.crearTarea(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(newTarea);
    }

    /** PUT /api/tareas/{id} : Actualizar una tarea existente */
    @PutMapping("/{id}")
    public ResponseEntity<TareaDTO> updateTarea(@PathVariable Long id, @RequestBody TareaDTO dto) {
        TareaDTO updatedTarea = tareaService.actualizarTarea(id, dto);
        return ResponseEntity.ok(updatedTarea);
    }

    /** DELETE /api/tareas/{id} : Eliminar una tarea */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTarea(@PathVariable Long id) {
        tareaService.eliminarTarea(id);
        return ResponseEntity.noContent().build();
    }
}