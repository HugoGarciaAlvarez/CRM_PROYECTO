package es.grupo.apirestCRM.dto;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

public class DashboardDTO {

    private BigDecimal ingresosTotales;
    private long clientesActivos;
    private List<TareaDTO> tareas;
    private Map<YearMonth, BigDecimal> ventasMensuales;
    private List<ClienteDTO> clientesRecientes; // NUEVO

    public DashboardDTO(BigDecimal ingresosTotales, long clientesActivos,
                        List<TareaDTO> tareas,
                        Map<YearMonth, BigDecimal> ventasMensuales,
                        List<ClienteDTO> clientesRecientes) { // NUEVO PARAM.
        this.ingresosTotales = ingresosTotales;
        this.clientesActivos = clientesActivos;
        this.tareas = tareas;
        this.ventasMensuales = ventasMensuales;
        this.clientesRecientes = clientesRecientes; // ASIGNACIÓN
    }

    // Getters y Setters
    public BigDecimal getIngresosTotales() { return ingresosTotales; }
    public void setIngresosTotales(BigDecimal ingresosTotales) { this.ingresosTotales = ingresosTotales; }

    public long getClientesActivos() { return clientesActivos; }
    public void setClientesActivos(long clientesActivos) { this.clientesActivos = clientesActivos; }

    public List<TareaDTO> getTareas() { return tareas; }
    public void setTareas(List<TareaDTO> tareas) { this.tareas = tareas; }



    public Map<YearMonth, BigDecimal> getVentasMensuales() { return ventasMensuales; }
    public void setVentasMensuales(Map<YearMonth, BigDecimal> ventasMensuales) { this.ventasMensuales = ventasMensuales; }

    public List<ClienteDTO> getClientesRecientes() { return clientesRecientes; }
    public void setClientesRecientes(List<ClienteDTO> clientesRecientes) { this.clientesRecientes = clientesRecientes; }
}