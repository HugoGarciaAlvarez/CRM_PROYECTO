package es.grupo.apirestCRM.dto;

public class ContactoDTO {

    private Long idContacto;
    private Long idCliente; // solo el id del cliente
    private Long idUsuario; // solo el id del usuario
    private String nombre;
    private String email;
    private String telefono;
    private String cargo;
    private String estado;

    public ContactoDTO() {
    }

    public ContactoDTO(Long idContacto, Long idCliente, Long idUsuario, String nombre, String email, String telefono, String cargo, String estado) {
        this.idContacto = idContacto;
        this.idCliente = idCliente;
        this.idUsuario = idUsuario;
        this.nombre = nombre;
        this.email = email;
        this.telefono = telefono;
        this.cargo = cargo;
        this.estado = estado;
    }

    // Getters y Setters
    public Long getIdContacto() {
        return idContacto;
    }

    public void setIdContacto(Long idContacto) {
        this.idContacto = idContacto;
    }

    public Long getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Long idCliente) {
        this.idCliente = idCliente;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
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

    public String getCargo() {
        return cargo;
    }

    public void setCargo(String cargo) {
        this.cargo = cargo;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
