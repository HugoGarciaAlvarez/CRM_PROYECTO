package es.grupo.apirestCRM.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import es.grupo.apirestCRM.model.Nivel;
import es.grupo.apirestCRM.model.Stage;

public class OportunidadDTO {

    private String id; // El ID de Oportunidad sigue siendo String
    private String name;
    
    
    private Long idCliente; 
    private Long idUsuario;
    
    private Stage stage;
    private Nivel nivel;
    private BigDecimal amount;
    private LocalDate startDate;
    private LocalDate closeDate;

    // -------------------
    // Constructores
    // -------------------

    public OportunidadDTO() {
    }

    public OportunidadDTO(String id, String name, Long idCliente, Long idUsuario, Stage stage, Nivel nivel,
            BigDecimal amount, LocalDate startDate, LocalDate closeDate) {
        this.id = id;
        this.name = name;
        this.idCliente = idCliente;
        this.idUsuario = idUsuario;
        this.stage = stage;
        this.nivel = nivel;
        this.amount = amount;
        this.startDate = startDate;
        this.closeDate = closeDate;
    }

    // -------------------
    // Getters y Setters
    // -------------------

    // ... (Getters y Setters para id y name siguen siendo String)

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // ⭐ Getters/Setters actualizados para Long
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
    
    // ... (El resto de Getters y Setters para Stage, Nivel, Amount, Dates se mantienen)

    public Stage getStage() {
        return stage;
    }

    public void setStage(Stage stage) {
        this.stage = stage;
    }

    public Nivel getNivel() {
        return nivel;
    }

    public void setNivel(Nivel nivel) {
        this.nivel = nivel;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getCloseDate() {
        return closeDate;
    }

    public void setCloseDate(LocalDate closeDate) {
        this.closeDate = closeDate;
    }
}