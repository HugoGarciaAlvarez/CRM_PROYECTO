package es.grupo.apirestCRM.model;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "usuarios")
public class Usuario implements UserDetails { // Implementar UserDetails

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private Rol role; // Relación con la Entidad Rol

    public Usuario() {}

    // GETTERS & SETTERS
    // (Dejamos los que ya tenías)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Rol getRole() { return role; }
    public void setRole(Rol role) { this.role = role; }


    // IMPLEMENTACIÓN DE USERDETAILS
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Devuelve el Rol como una GrantedAuthority
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.getName()));
    }

    // Dejamos las cuentas siempre como activas/no expiradas para una implementación simple
    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }

    
}