package es.grupo.apirestCRM.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.grupo.apirestCRM.dto.DashboardDTO;
import es.grupo.apirestCRM.dto.TareaDTO;
import es.grupo.apirestCRM.model.Tarea;
import es.grupo.apirestCRM.model.Usuario;
import es.grupo.apirestCRM.repository.UsuarioRepository;
import es.grupo.apirestCRM.service.DashboardService;

// DashboardController.java (SOLO SE MUESTRA EL MÉTODO CORREGIDO)
@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final UsuarioRepository usuarioRepository;

    public DashboardController(DashboardService dashboardService, UsuarioRepository usuarioRepository) {
        this.dashboardService = dashboardService;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/inicio")
    public DashboardDTO getDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        
        Usuario usuario = usuarioRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + userDetails.getUsername()));

        // 1. Obtener Entidades
        List<Tarea> tareasEntidades = dashboardService.getTareasUsuario(usuario);
        
        // 2. Mapear a DTOs
        List<TareaDTO> tareasDto = tareasEntidades.stream()
                .map(TareaDTO::new)
                .collect(Collectors.toList());
      
        // 3. Construir el DTO final
        return new DashboardDTO(
                dashboardService.getIngresosTotales(usuario),
                dashboardService.getClientesActivos(usuario),
                tareasDto,
                dashboardService.getVentasMensuales(usuario),
                dashboardService.getUltimosClientes(usuario)
        );
    }
}