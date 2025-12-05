package es.grupo.apirestCRM.dto;

import java.time.LocalDateTime;

import es.grupo.apirestCRM.model.Incidencia;

public class IncidenciaDTO {

    private Long idIncidencia;
    private String descripcion;
    private String estado;      // Mapeado desde el Enum Estado
    private String prioridad;   // Mapeado desde el Enum Prioridad
    private String clienteNombre;
    private String contactoNombre;
    private LocalDateTime fechaApertura; // Incluimos la fecha de apertura

    public IncidenciaDTO(Incidencia incidencia) {
        this.idIncidencia = incidencia.getIdIncidencia();
        this.descripcion = incidencia.getDescripcion();
        this.fechaApertura = incidencia.getFechaApertura();
        
        // Mapeo de Enums a String
        this.estado = incidencia.getEstado() != null ? incidencia.getEstado().name() : null;
        this.prioridad = incidencia.getPrioridad() != null ? incidencia.getPrioridad().name() : null;
        
        // Mapeo seguro a nombres para evitar la recursión
        this.clienteNombre = incidencia.getCliente() != null ? incidencia.getCliente().getNombre() : null;
        this.contactoNombre = incidencia.getContacto() != null ? incidencia.getContacto().getNombre() : null;
    }

    // Getters y Setters
    public Long getIdIncidencia() { return idIncidencia; }
    public void setIdIncidencia(Long idIncidencia) { this.idIncidencia = idIncidencia; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getPrioridad() { return prioridad; }
    public void setPrioridad(String prioridad) { this.prioridad = prioridad; }

    public String getClienteNombre() { return clienteNombre; }
    public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }

    public String getContactoNombre() { return contactoNombre; }
    public void setContactoNombre(String contactoNombre) { this.contactoNombre = contactoNombre; }
    
    public LocalDateTime getFechaApertura() { return fechaApertura; }
    public void setFechaApertura(LocalDateTime fechaApertura) { this.fechaApertura = fechaApertura; }
}