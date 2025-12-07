package es.grupo.apirestCRM.service;

import java.util.List;

import org.springframework.stereotype.Service;

import es.grupo.apirestCRM.dto.ClienteDTO;
import es.grupo.apirestCRM.model.Cliente;
import es.grupo.apirestCRM.model.EstadoCliente;
import es.grupo.apirestCRM.model.Usuario;
import es.grupo.apirestCRM.repository.ClienteRepository;
import es.grupo.apirestCRM.repository.UsuarioRepository;

@Service
public class ClienteService {

    private final ClienteRepository repo;
    private final UsuarioRepository usuarioRepo;

    public ClienteService(ClienteRepository repo, UsuarioRepository usuarioRepo) {
        this.repo = repo;
        this.usuarioRepo = usuarioRepo;
    }

    private ClienteDTO toDTO(Cliente c) {
        ClienteDTO dto = new ClienteDTO();
        dto.setIdCliente(c.getIdCliente());
        dto.setNombre(c.getNombre());
        dto.setEmail(c.getEmail());
        dto.setTelefono(c.getTelefono());
        dto.setEstado(c.getEstado().name());
        return dto;
    }

    public List<ClienteDTO> listarPorUsuario(Long idUsuario) {
        return repo.findByUsuarioId(idUsuario)
                .stream().map(this::toDTO).toList();
    }

    public ClienteDTO crear(ClienteDTO dto, Long idUsuario) {
        Usuario u = usuarioRepo.findById(idUsuario).orElseThrow();
        Cliente c = new Cliente();
        c.setUsuario(u);
        c.setNombre(dto.getNombre());
        c.setEmail(dto.getEmail());
        c.setTelefono(dto.getTelefono());
        c.setEstado(EstadoCliente.valueOf(dto.getEstado()));
        return toDTO(repo.save(c));
    }

    public ClienteDTO actualizar(Long idCliente, ClienteDTO dto, Long idUsuario) {
        Cliente c = repo.findByIdClienteAndUsuarioId(idCliente, idUsuario).orElseThrow();
        c.setNombre(dto.getNombre());
        c.setEmail(dto.getEmail());
        c.setTelefono(dto.getTelefono());
        c.setEstado(EstadoCliente.valueOf(dto.getEstado()));
        return toDTO(repo.save(c));
    }

    public void eliminar(Long idCliente, Long idUsuario) {
        Cliente c = repo.findByIdClienteAndUsuarioId(idCliente, idUsuario).orElseThrow();
        repo.delete(c);
    }
}