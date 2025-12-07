package es.grupo.apirestCRM.service;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import es.grupo.apirestCRM.dto.ClienteDTO;
import es.grupo.apirestCRM.model.Oportunidad;
import es.grupo.apirestCRM.model.Stage;
import es.grupo.apirestCRM.model.Tarea;
import es.grupo.apirestCRM.model.Usuario;
import es.grupo.apirestCRM.repository.TareaRepository;
import jakarta.transaction.Transactional;
import es.grupo.apirestCRM.repository.ClienteRepository;
import es.grupo.apirestCRM.repository.OportunidadRepository;

@Service
public class DashboardService {

    private final OportunidadRepository oportunidadRepository;
    private final TareaRepository tareaRepository;
    private final ClienteRepository clienteRepository;

   
    public DashboardService(OportunidadRepository oportunidadRepository,
            TareaRepository tareaRepository,
            ClienteRepository clienteRepository) {
        this.oportunidadRepository = oportunidadRepository;
        this.tareaRepository = tareaRepository;
        this.clienteRepository = clienteRepository;
    }

    // --- Ventas mensuales por usuario ---
    public Map<YearMonth, BigDecimal> getVentasMensuales(Usuario usuario) {
        List<Oportunidad> oportunidades = oportunidadRepository.findByUsuarioAndStage(usuario, Stage.CERRADA_GANADA);

        // Agrupar por mes y sumar amount en un TreeMap (orden natural)
        return oportunidades.stream()
                .collect(Collectors.groupingBy(
                        opp -> YearMonth.from(opp.getCloseDate()),
                        TreeMap::new, // <-- ordena por YearMonth
                        Collectors.reducing(BigDecimal.ZERO, Oportunidad::getAmount, BigDecimal::add)));
    }

    // --- Tareas del usuario ---
    public List<Tarea> getTareasUsuario(Usuario usuario) {
        // Asumiendo que solo se traen las tareas pendientes o activas
        return tareaRepository.findByUsuario(usuario);
    }


    // --- KPIs simples ---
    public BigDecimal getIngresosTotales(Usuario usuario) {
        return oportunidadRepository.findByUsuario(usuario).stream()
                .map(Oportunidad::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public long getClientesActivos(Usuario usuario) {
        // Consideramos "clientes activos" los que tienen al menos una oportunidad
        return oportunidadRepository.findByUsuario(usuario).stream()
                .map(Oportunidad::getCliente)
                .distinct()
                .count();
    }

    @Transactional // <--- Necesario para cargar correctamente el ID del usuario
    public List<ClienteDTO> getUltimosClientes(Usuario usuario) {
        return clienteRepository.findTop5ByUsuarioOrderByIdClienteDesc(usuario).stream()
            // Mapeo manual campo por campo, respetando el orden del constructor DTO
            .map(c -> new ClienteDTO(
                c.getIdCliente(), // 1. idCliente
                // 2. idUsuarioResponsable (Requiere acceder a la relación LAZY)
                c.getUsuario() != null ? c.getUsuario().getId() : null, 
                c.getNombre(),      // 3. nombre
                c.getEmail(),       // 4. email
                c.getTelefono(),    // 5. telefono
                c.getDireccion(),   // 6. direccion
                // 7. estado (Se mapea el Enum a String)
                c.getEstado() != null ? c.getEstado().name() : null
            ))
            .collect(Collectors.toList());
    }
}
