package es.grupo.apirestCRM.dto;

import java.time.LocalDate;

import es.grupo.apirestCRM.model.Tarea;

// DTO simple para Tarea, reutilizable para listados o dashboards
// TareaDTO.java

public class TareaDTO {
    // --- Campos de Salida (Response) ---
    private Long idTarea;
    private String nombreCliente; 
    
    // --- Campos de Entrada/Salida (Request & Response) ---
    private String titulo;
    private String descripcion;
    private String estado;
    private String prioridad;
    private LocalDate fechaVencimiento;
    
    // --- Campos de Entrada/Salida (Request & Response) para manejo de relaciones ---
    private Long idUsuario; // Necesario para saber quién crea la tarea (Request)
    private Long idCliente; // ⬅️ CLAVE: Usado para enviar/recibir el ID del cliente
    // Nota: El idIncidencia se manejaría de forma similar si existiera esa relación.

    // Constructor vacío (necesario para deserialización JSON de Angular)
    public TareaDTO() {}

    /**
     * Constructor de Mapeo (Entidad Tarea -> DTO).
     * Usado por el Servicio para transformar la Tarea antes de enviarla a Angular (READ).
     */
    public TareaDTO(Tarea tarea) {
        this.idTarea = tarea.getIdTarea();
        this.titulo = tarea.getTitulo();
        this.descripcion = tarea.getDescripcion();
        this.estado = tarea.getEstado();
        this.prioridad = tarea.getPrioridad();
        this.fechaVencimiento = tarea.getFechaVencimiento();

        // Mapeo de relaciones (Cliente)
        if (tarea.getCliente() != null) {
            this.nombreCliente = tarea.getCliente().getNombre();
            this.idCliente = tarea.getCliente().getIdCliente(); // 🚨 Ahora el ID se envía de vuelta
        } else {
            this.nombreCliente = null;
            this.idCliente = null;
        }
        
        // Mapeo de relaciones (Usuario)
        if (tarea.getUsuario() != null) {
            this.idUsuario = tarea.getUsuario().getId(); // Asumiendo que Usuario.id es Long
        } else {
             this.idUsuario = null;
        }
    }
    
    // --- Getters y Setters (Completos para todos los campos) ---
    
    public Long getIdTarea() { return idTarea; }
    public void setIdTarea(Long idTarea) { this.idTarea = idTarea; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getPrioridad() { return prioridad; }
    public void setPrioridad(String prioridad) { this.prioridad = prioridad; }
    public LocalDate getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(LocalDate fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }
    public String getNombreCliente() { return nombreCliente; }
    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }
    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }
    public Long getIdCliente() { return idCliente; }
    public void setIdCliente(Long idCliente) { this.idCliente = idCliente; }
}