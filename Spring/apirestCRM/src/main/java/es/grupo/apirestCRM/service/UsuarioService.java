package es.grupo.apirestCRM.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import es.grupo.apirestCRM.dto.RegisterRequest;
import es.grupo.apirestCRM.dto.UserDTO;
import es.grupo.apirestCRM.model.Rol;
import es.grupo.apirestCRM.model.Usuario;
import es.grupo.apirestCRM.repository.RolRepository;
import es.grupo.apirestCRM.repository.UsuarioRepository;



@Service
public class UsuarioService {

    private final UsuarioRepository userRepo;
    private final RolRepository rolRepo; // ¡Nuevo Repositorio!
    private final PasswordEncoder passwordEncoder;
    // Quitamos la inyección de JwtService y la lógica de login si usamos AuthController

    public UsuarioService(UsuarioRepository userRepo, RolRepository rolRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.rolRepo = rolRepo;
        this.passwordEncoder = passwordEncoder;
    }

    // Usaremos un Enum para los nombres de roles para consistencia
    public enum ERole {
        ROLE_USER,
        ROLE_ADMIN
    }

    public UserDTO register(RegisterRequest request) {

        Usuario user = new Usuario();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail()); // Asumiendo que viene en RegisterRequest
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        // Buscar el objeto Rol en la DB
        Rol defaultRole = rolRepo.findByName(ERole.ROLE_USER.name())
            .orElseThrow(() -> new RuntimeException("Error: Rol 'ROLE_USER' no encontrado."));

        user.setRole(defaultRole);

        userRepo.save(user);

        return toDTO(user);
    }

    // Ya no necesitas el método login aquí, se maneja en AuthController
    
    private UserDTO toDTO(Usuario user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setRole(user.getRole().getName()); // Usar getName() del Rol
        return dto;
    }
}