package es.grupo.apirestCRM.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import es.grupo.apirestCRM.dto.ContactoDTO;
import es.grupo.apirestCRM.model.Cliente;
import es.grupo.apirestCRM.model.Contacto;
import es.grupo.apirestCRM.model.Usuario;
import es.grupo.apirestCRM.repository.ClienteRepository;
import es.grupo.apirestCRM.repository.ContactoRepository;
import es.grupo.apirestCRM.repository.UsuarioRepository;

@Service
public class ContactoService {

    @Autowired
    private ContactoRepository contactoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Convertir entidad a DTO
    private ContactoDTO convertirADTO(Contacto contacto) {
        return new ContactoDTO(
                contacto.getIdContacto(),
                contacto.getCliente().getIdCliente(),
                contacto.getUsuario().getId(),
                contacto.getNombre(),
                contacto.getEmail(),
                contacto.getTelefono(),
                contacto.getCargo(),
                contacto.getEstado()
        );
    }

    // Listar todos los contactos
    public List<ContactoDTO> listarContactos() {
        return contactoRepository.findAll().stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    // Obtener por ID
    public Optional<ContactoDTO> obtenerContactoPorId(Long id) {
        return contactoRepository.findById(id).map(this::convertirADTO);
    }

    // Crear contacto
    public ContactoDTO crearContacto(ContactoDTO dto) {
        Cliente cliente = clienteRepository.findById(dto.getIdCliente())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Contacto contacto = new Contacto(
                cliente,
                usuario,
                dto.getNombre(),
                dto.getEmail(),
                dto.getTelefono(),
                dto.getCargo(),
                dto.getEstado()
        );

        return convertirADTO(contactoRepository.save(contacto));
    }

    // Actualizar contacto
    public ContactoDTO actualizarContacto(Long id, ContactoDTO dto) {
        Contacto contacto = contactoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contacto no encontrado"));

        Cliente cliente = clienteRepository.findById(dto.getIdCliente())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        contacto.setCliente(cliente);
        contacto.setUsuario(usuario);
        contacto.setNombre(dto.getNombre());
        contacto.setEmail(dto.getEmail());
        contacto.setTelefono(dto.getTelefono());
        contacto.setCargo(dto.getCargo());
        contacto.setEstado(dto.getEstado());

        return convertirADTO(contactoRepository.save(contacto));
    }

    // Eliminar contacto
    public void eliminarContacto(Long id) {
        contactoRepository.deleteById(id);
    }
}