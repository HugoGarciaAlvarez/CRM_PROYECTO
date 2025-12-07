package es.grupo.apirestCRM.service;

import java.util.List;
import java.util.Optional;
import java.util.Set; 
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.grupo.apirestCRM.dto.OportunidadDTO;
import es.grupo.apirestCRM.model.Cliente;
import es.grupo.apirestCRM.model.Oportunidad;
import es.grupo.apirestCRM.model.Usuario;
import es.grupo.apirestCRM.repository.ClienteRepository;
import es.grupo.apirestCRM.repository.OportunidadRepository;
import es.grupo.apirestCRM.repository.UsuarioRepository;

@Service
public class OportunidadService {

    @Autowired
    private OportunidadRepository oportunidadRepository;
    @Autowired
    private ClienteRepository clienteRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;

    // -------------------
    // Mapeo Entity a DTO
    // -------------------
    private OportunidadDTO toDTO(Oportunidad oportunidad) {
        OportunidadDTO dto = new OportunidadDTO();
        dto.setId(oportunidad.getId());
        dto.setName(oportunidad.getName());
        dto.setStage(oportunidad.getStage());
        dto.setNivel(oportunidad.getNivel());
        dto.setAmount(oportunidad.getAmount());
        dto.setStartDate(oportunidad.getStartDate());
        dto.setCloseDate(oportunidad.getCloseDate());

        if (oportunidad.getCliente() != null) {
            // Asumiendo que Cliente tiene getIdCliente()
            dto.setIdCliente(oportunidad.getCliente().getIdCliente()); 
        }

        if (oportunidad.getUsuario() != null) {
            // Asumiendo que Usuario tiene getId() o getUid()
            dto.setIdUsuario(oportunidad.getUsuario().getId()); 
        }
        return dto;
    }

    // -------------------
    // Mapeo DTO a Entity
    // -------------------
    private Oportunidad toEntity(OportunidadDTO dto) {
        Oportunidad oportunidad = new Oportunidad();
        
        // El ID será asignado en el método save() si es una creación. 
        // Aquí solo lo copiamos si ya viene (para actualizaciones).
        oportunidad.setId(dto.getId()); 
        oportunidad.setName(dto.getName());
        oportunidad.setStage(dto.getStage());
        oportunidad.setNivel(dto.getNivel());
        oportunidad.setAmount(dto.getAmount());
        oportunidad.setStartDate(dto.getStartDate());
        oportunidad.setCloseDate(dto.getCloseDate());

        // Manejo de relaciones ManyToOne
        if (dto.getIdCliente() != null) {
            Cliente cliente = clienteRepository.findById(dto.getIdCliente())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado con ID: " + dto.getIdCliente()));
            oportunidad.setCliente(cliente);
        }
        if (dto.getIdUsuario() != null) {
            Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + dto.getIdUsuario()));
            oportunidad.setUsuario(usuario);
        }
        return oportunidad;
    }

    // ----------------------------------------------------
    // LÓGICA DE FILTRADO (NUEVO)
    // ----------------------------------------------------

    /**
     * Verifica si el nombre de la oportunidad coincide con el patrón "Mes Año" 
     * o solo "Mes" (ej: "Enero 2025", "Diciembre").
     * @param name El nombre de la oportunidad.
     * @return true si debe ser ignorada, false en caso contrario.
     */
    private boolean isMonthYearOpportunityName(String name) {
        if (name == null) {
            return false;
        }

        // Convertir a minúsculas y limpiar espacios
        String lowerName = name.trim().toLowerCase();

        // Nombres de los meses en español (minúsculas)
        Set<String> monthNames = Set.of(
            "enero", "febrero", "marzo", "abril", "mayo", "junio",
            "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
        );

        // Dividir por espacios
        String[] parts = lowerName.split("\\s+");

        // Caso 1: Nombre es solo el mes (ej: "enero")
        if (parts.length == 1 && monthNames.contains(parts[0])) {
            return true;
        }

        // Caso 2: Nombre es "Mes Año" (ej: "enero 2025")
        if (parts.length == 2) {
            String month = parts[0];
            String year = parts[1];
            
            // Verificar si el primer es un mes y el segundo es un año (4 dígitos)
            boolean isMonth = monthNames.contains(month);
            // Uso de regex simple para asegurar que el segundo elemento es un número de 4 dígitos (año)
            boolean isYear = year.matches("\\d{4}"); 

            if (isMonth && isYear) {
                return true;
            }
        }

        return false;
    }

    // -------------------
    // Operaciones CRUD
    // -------------------

    @Transactional(readOnly = true)
    public List<OportunidadDTO> findAll() {
        return oportunidadRepository.findAll().stream()
                // APLICA EL FILTRO: Solo mapea a DTO si el nombre NO es un Mes/Año
                .filter(oportunidad -> !isMonthYearOpportunityName(oportunidad.getName())) 
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<OportunidadDTO> findById(String id) {
        return oportunidadRepository.findById(id).map(this::toDTO);
    }

    @Transactional
    public OportunidadDTO save(OportunidadDTO oportunidadDTO) {
        // Generar el ID si es una CREACIÓN (el DTO viene sin ID)
        if (oportunidadDTO.getId() == null || oportunidadDTO.getId().isEmpty()) {
            // Generar un ID único de tipo String (UUID)
            oportunidadDTO.setId(UUID.randomUUID().toString()); 
        }
        
        // Convertir el DTO (que ahora tiene ID) a Entity
        Oportunidad oportunidad = toEntity(oportunidadDTO);
        
        // Guardar/actualizar la entidad
        Oportunidad savedOportunidad = oportunidadRepository.save(oportunidad);
        return toDTO(savedOportunidad);
    }

    @Transactional
    public OportunidadDTO update(String id, OportunidadDTO oportunidadDTO) {
        // 1. Asegurar que la oportunidad existe antes de actualizar
        oportunidadRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Oportunidad no encontrada para actualizar con ID: " + id));

        // 2. Asignar el ID de la ruta al DTO para que toEntity lo use
        oportunidadDTO.setId(id);
        
        Oportunidad oportunidad = toEntity(oportunidadDTO);
        Oportunidad updatedOportunidad = oportunidadRepository.save(oportunidad);
        return toDTO(updatedOportunidad);
    }

    @Transactional
    public void delete(String id) {
        oportunidadRepository.deleteById(id);
    }
}