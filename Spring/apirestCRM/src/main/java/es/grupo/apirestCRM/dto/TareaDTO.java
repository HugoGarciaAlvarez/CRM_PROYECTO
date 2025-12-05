package es.grupo.apirestCRM.dto;

import es.grupo.apirestCRM.model.Tarea;

// DTO simple para Tarea, reutilizable para listados o dashboards
public class TareaDTO {
    private Long idTarea;
    private String titulo;
    private String estado;
    private String prioridad;
    private String clienteNombre;
    private String usuarioUsername;

    // Constructor que acepta la entidad Tarea y mapea los campos necesarios
    public TareaDTO(Tarea tarea) {
        this.idTarea = tarea.getIdTarea();
        this.titulo = tarea.getTitulo();
        this.estado = tarea.getEstado();
        this.prioridad = tarea.getPrioridad();
        // Mapeo seguro a nombres/usernames para evitar bucles (recursión)
        this.clienteNombre = tarea.getCliente() != null ? tarea.getCliente().getNombre() : null;
        this.usuarioUsername = tarea.getUsuario() != null ? tarea.getUsuario().getUsername() : null;
    }

    // Getters y Setters
    public Long getIdTarea() {
        return idTarea;
    }

    public void setIdTarea(Long idTarea) {
        this.idTarea = idTarea;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getPrioridad() {
        return prioridad;
    }

    public void setPrioridad(String prioridad) {
        this.prioridad = prioridad;
    }

    public String getClienteNombre() {
        return clienteNombre;
    }

    public void setClienteNombre(String clienteNombre) {
        this.clienteNombre = clienteNombre;
    }

    public String getUsuarioUsername() {
        return usuarioUsername;
    }

    public void setUsuarioUsername(String usuarioUsername) {
        this.usuarioUsername = usuarioUsername;
    }
}