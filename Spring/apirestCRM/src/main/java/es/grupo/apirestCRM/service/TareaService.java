package es.grupo.apirestCRM.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import es.grupo.apirestCRM.dto.TareaDTO;
import es.grupo.apirestCRM.model.Tarea;

import es.grupo.apirestCRM.repository.ClienteRepository;
import es.grupo.apirestCRM.repository.TareaRepository;
import es.grupo.apirestCRM.repository.UsuarioRepository;
import org.springframework.transaction.annotation.Transactional;


// TareaService.java
// (Importaciones omitidas por brevedad)

@Service
@Transactional 
public class TareaService {

    @Autowired
    private TareaRepository tareaRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private ClienteRepository clienteRepository;

    // ------------------------------------
    // C R U D (TAREAS)
    // ------------------------------------

    // C - CREATE
    public TareaDTO crearTarea(TareaDTO dto) {
        Tarea tarea = new Tarea();
        
        // 1. Asignar el usuario (obligatorio)
        tarea.setUsuario(usuarioRepository.findById(dto.getIdUsuario())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + dto.getIdUsuario())));
        
        // 2. Asignar cliente (opcional): Buscar por ID proporcionado por el DTO
        if (dto.getIdCliente() != null) {
            tarea.setCliente(clienteRepository.findById(dto.getIdCliente())
                // Si no se encuentra el cliente, se establece a null, evitando un error 500
                .orElse(null)); 
        } else {
             tarea.setCliente(null); // Asegurar que es null si no se proporciona ID
        }
        
        // 3. Asignar campos básicos
        tarea.setTitulo(dto.getTitulo());
        tarea.setDescripcion(dto.getDescripcion());
        if (dto.getEstado() != null) tarea.setEstado(dto.getEstado());
        if (dto.getPrioridad() != null) tarea.setPrioridad(dto.getPrioridad());
        tarea.setFechaVencimiento(dto.getFechaVencimiento());
        
        Tarea savedTarea = tareaRepository.save(tarea);
        return new TareaDTO(savedTarea); // Mapeo de vuelta a DTO (incluye nombreCliente e idCliente)
    }
    
    // R - READ (All)
    @Transactional(readOnly = true)
    public List<TareaDTO> obtenerTodasLasTareas() {
        return tareaRepository.findAll().stream()
            .map(TareaDTO::new) 
            .collect(Collectors.toList());
    }

    // R - READ (One)
    @Transactional(readOnly = true)
    public TareaDTO obtenerTareaPorId(Long id) {
        Tarea tarea = tareaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Tarea no encontrada con ID: " + id));
        return new TareaDTO(tarea); 
    }

    // U - UPDATE
    public TareaDTO actualizarTarea(Long id, TareaDTO dto) {
        Tarea tarea = tareaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Tarea no encontrada con ID: " + id));

        // Actualizar relaciones (El DTO de entrada debe contener el ID del cliente a enlazar)
        if (dto.getIdCliente() != null) {
            tarea.setCliente(clienteRepository.findById(dto.getIdCliente()).orElse(null));
        } else {
             tarea.setCliente(null); // Si el ID es null, desenlazar el cliente
        }
        
        // Actualizar campos
        tarea.setTitulo(dto.getTitulo());
        tarea.setDescripcion(dto.getDescripcion());
        tarea.setEstado(dto.getEstado());
        tarea.setPrioridad(dto.getPrioridad());
        tarea.setFechaVencimiento(dto.getFechaVencimiento());

        Tarea updatedTarea = tareaRepository.save(tarea);
        return new TareaDTO(updatedTarea); 
    }

    // D - DELETE
    public void eliminarTarea(Long id) {
        if (!tareaRepository.existsById(id)) {
            throw new RuntimeException("Tarea no encontrada con ID: " + id);
        }
        tareaRepository.deleteById(id);
    }
}