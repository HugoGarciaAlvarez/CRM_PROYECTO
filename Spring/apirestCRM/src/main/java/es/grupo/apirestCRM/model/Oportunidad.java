package es.grupo.apirestCRM.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "OPORTUNIDAD")
public class Oportunidad {

    @Id
    private String id;

    private String name;

    @ManyToOne
    @JoinColumn(name = "id_cliente")
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    private Stage stage;

    @Enumerated(EnumType.STRING)
    private Nivel nivel;

    private BigDecimal amount;
    private LocalDate startDate;
    private LocalDate closeDate;

    // -------------------
    // Constructores
    // -------------------

    public Oportunidad() {
    }

    public Oportunidad(String id, String name, Cliente cliente, Usuario usuario,
            Stage stage, Nivel nivel, BigDecimal amount,
            LocalDate startDate, LocalDate closeDate) {
        this.id = id;
        this.name = name;
        this.cliente = cliente;
        this.usuario = usuario;
        this.stage = stage;
        this.nivel = nivel;
        this.amount = amount;
        this.startDate = startDate;
        this.closeDate = closeDate;
    }

    // Constructor solo con campos esenciales (opcional)
    public Oportunidad(String id, String name, Stage stage, Nivel nivel, BigDecimal amount) {
        this.id = id;
        this.name = name;
        this.stage = stage;
        this.nivel = nivel;
        this.amount = amount;
    }

    // -------------------
    // Getters y Setters
    // -------------------

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

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

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
