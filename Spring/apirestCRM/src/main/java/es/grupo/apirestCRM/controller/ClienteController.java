package es.grupo.apirestCRM.controller;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.grupo.apirestCRM.dto.ClienteDTO;
import es.grupo.apirestCRM.model.Usuario;
import es.grupo.apirestCRM.service.ClienteService;

@RestController
@RequestMapping("/clientes")
public class ClienteController {

    private final ClienteService service;

    public ClienteController(ClienteService service) {
        this.service = service;
    }

    private Usuario getLoggedUser() {
        return (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @GetMapping
    public List<ClienteDTO> listar() {
        return service.listarPorUsuario(getLoggedUser().getId());
    }

    @PostMapping
    public ClienteDTO crear(@RequestBody ClienteDTO dto) {
        return service.crear(dto, getLoggedUser().getId());
    }

    @PutMapping("/{id}")
    public ClienteDTO actualizar(@PathVariable Long id, @RequestBody ClienteDTO dto) {
        return service.actualizar(id, dto, getLoggedUser().getId());
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id, getLoggedUser().getId());
    }
}