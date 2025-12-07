package es.grupo.apirestCRM.dto;



public class ClienteDTO {

    private Long idCliente;
    private Long idUsuarioResponsable; 
    private String nombre;
    private String email;
    private String telefono;
    private String direccion;
    private String estado; 

    public ClienteDTO() {
    }

    // Constructor con campos principales
    public ClienteDTO(Long idCliente, Long idUsuarioResponsable, String nombre, String email, String telefono, String direccion, String estado) {
        this.idCliente = idCliente;
        this.idUsuarioResponsable = idUsuarioResponsable;
        this.nombre = nombre;
        this.email = email;
        this.telefono = telefono;
        this.direccion = direccion;
        this.estado = estado;
    }
     public ClienteDTO(Long idCliente, String nombre, String email, String telefono, String estado) {
        this.idCliente = idCliente;
        this.nombre = nombre;
        this.email = email;
        this.telefono = telefono;
        this.estado = estado;
    }
    
    // Constructor/Mapper desde la Entidad Cliente (Añadido previamente)
   
    public ClienteDTO(Long idCliente, String nombre) {
        this.idCliente = idCliente;
        this.nombre = nombre;
    }

    // --- Getters y Setters ---

    public Long getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Long idCliente) {
        this.idCliente = idCliente;
    }

    public Long getIdUsuarioResponsable() {
        return idUsuarioResponsable;
    }

    public void setIdUsuarioResponsable(Long idUsuarioResponsable) {
        this.idUsuarioResponsable = idUsuarioResponsable;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}