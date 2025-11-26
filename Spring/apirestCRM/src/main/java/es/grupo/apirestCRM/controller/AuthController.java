package es.grupo.apirestCRM.controller;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.grupo.apirestCRM.dto.LoginRequest; // Necesitas crear tus DTOs (Request/Response)
import es.grupo.apirestCRM.dto.LoginResponse; 
import es.grupo.apirestCRM.dto.RegisterRequest; 
import es.grupo.apirestCRM.dto.UserDTO;
import es.grupo.apirestCRM.model.Usuario;
import es.grupo.apirestCRM.security.JwtService;
import es.grupo.apirestCRM.service.UsuarioService;


@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UsuarioService userService;
    private final AuthenticationManager authenticationManager; // Inyectado desde SecurityConfig
    private final JwtService jwtService;

    public AuthController(UsuarioService userService, AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public UserDTO register(@RequestBody RegisterRequest request) {
        return userService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        
        // 1. Intentar la autenticación a través del AuthenticationManager de Spring Security
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        // Si llega aquí, la autenticación fue exitosa. Guardamos el contexto.
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 2. Obtener los detalles del usuario para generar el token
        Usuario userDetails = (Usuario) authentication.getPrincipal(); 
        
        // 3. Generar el JWT
        String token = jwtService.generateToken(
            userDetails.getUsername(), 
            userDetails.getRole().getName()
        ); 

        // 4. Devolver el token a Angular
        return new LoginResponse(token);
    }
}