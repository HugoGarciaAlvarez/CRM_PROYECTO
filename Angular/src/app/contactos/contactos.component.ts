import { ChangeDetectionStrategy, Component, signal, OnInit, inject, computed } from '@angular/core';
// Importamos solo ContactoService e interfaz Contacto
import { ContactoService, Contacto } from '../services/contacto.service'; 
// Importamos el servicio de Clientes y su interfaz Cliente
import { ClientesService, Cliente } from '../services/clientes.service'; 
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // <<-- ¡NUEVO! Importación de FormsModule

@Component({
  selector: 'app-contactos', 
  standalone: true,
  templateUrl: './contactos.component.html',
  styles: [
    `
      .page-content-container {
        font-family: 'Inter', sans-serif;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, HttpClientModule, FormsModule], // <<-- ¡Añadido FormsModule!
})
export class ContactosComponent implements OnInit {
  // Inyección de servicios
  private contactoService = inject(ContactoService);
  private clientesService = inject(ClientesService); 

  // Exposición de signals desde el servicio
  public contacts = this.contactoService.contacts;

  // NUEVO: Estado para la lista de clientes
  public clientes = signal<Cliente[]>([]); 

  // Estado de la UI
  public isLoading = signal(true);
  public error = signal<string | null>(null);

  // Signals para manejar el estado de búsqueda y filtro
  public searchTerm = signal('');
  public filterStatus = signal<Contacto['estado'] | 'Todos'>('Todos');

  // Modal State
  public isModalOpen = signal(false);
  public editingContact = signal<Contacto | null>(null);

  // Estado para el modal de confirmación de eliminación
  public showDeleteConfirm = signal(false);
  public contactToDelete = signal<{ id: number; nombre: string } | null>(null);

  // Estado para notificaciones de éxito/error
  public confirmationMessage = signal<string | null>(null);
  public isDeleting = signal(false);

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  /**
   * Carga inicial de contactos y clientes.
   */
  async cargarDatosIniciales(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      // 1. Cargar Clientes
      const loadedClientes = await this.clientesService.getClientes();
      this.clientes.set(loadedClientes);

      // 2. Cargar Contactos
      const errorMessage = await this.contactoService.loadContacts();
      if (errorMessage) {
        this.error.set(errorMessage);
      }
    } catch (e: any) {
       this.error.set(e.message || "Error desconocido al cargar datos iniciales.");
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Propiedad computada que aplica el filtro de búsqueda y estado.
   */
  public filteredContacts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const status = this.filterStatus();
    const allContacts = this.contacts();

    return allContacts.filter(contact => {
      // 1. Filtrado por Estado
      const statusMatch = status === 'Todos' || contact.estado === status;

      // 2. Filtrado por Término de Búsqueda (Nombre, Email o Empresa/Cargo)
      const searchMatch = 
        contact.nombre.toLowerCase().includes(term) ||
        contact.email.toLowerCase().includes(term) ||
        contact.empresa.toLowerCase().includes(term); 

      return statusMatch && searchMatch;
    });
  });

  /**
   * Llama al servicio para cargar los contactos y gestiona los estados de carga y error.
   * (Solo recarga contactos).
   */
  async cargarContactos(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    const errorMessage = await this.contactoService.loadContacts();
    
    if (errorMessage) {
      this.error.set(errorMessage);
    }
    this.isLoading.set(false);
  }
  
  /**
   * Maneja el evento de input para actualizar el término de búsqueda.
   */
  handleSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  /**
   * Maneja el evento de cambio para actualizar el estado del filtro.
   */
  handleStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as Contacto['estado'] | 'Todos';
    this.filterStatus.set(value);
  }
  
  /**
   * Genera las clases de Tailwind CSS para el badge de estado.
   */
  getStatusClasses(estado: Contacto['estado']): string {
    switch (estado) {
      case 'Activo':
        return 'bg-green-100 text-green-800 ring-green-600/20';
      case 'Potencial':
        return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
      case 'Inactivo':
        return 'bg-red-100 text-red-800 ring-red-600/20';
      default:
        return 'bg-gray-100 text-gray-800 ring-gray-600/20';
    }
  }
  
  /**
   * Obtiene el nombre del cliente por su ID.
   */
  private getClienteNameById(id: number): string {
    return this.clientes().find(c => c.id === id)?.nombre || 'Cliente Desconocido';
  }

  // ******************************************************
  // MODAL & CRUD ACTIONS
  // ******************************************************

  /**
   * Abre el modal para editar un contacto existente.
   */
  openEditModal(contact: Contacto): void {
    this.editingContact.set({...contact});
    this.isModalOpen.set(true);
  }

  /**
   * Abre el modal para crear un nuevo contacto.
   */
  openNewContactModal(): void {
    // Definimos el valor inicial para idCliente. 
    // Usamos 0 para forzar la selección del desplegable.
    const initialClienteId = 0; 

    const newContact: Contacto = {
      id: 0, // ID 0 para indicar que es nuevo
      nombre: '', 
      email: '', 
      telefono: '', 
      empresa: '', // Vacío, se llenará al seleccionar el cliente
      estado: 'Potencial',
      idCliente: initialClienteId,
      idUsuario: 1, 
    };
    this.editingContact.set(newContact);
    this.isModalOpen.set(true);
  }

  /**
   * Cierra el modal de edición/creación.
   */
  closeEditModal(): void {
    this.isModalOpen.set(false);
    this.editingContact.set(null);
    this.error.set(null); 
  }

  /**
   * Actualiza un campo del contacto que se está editando en el signal local.
   */
  updateEditingContact(field: keyof Contacto, event: Event): void {
    const target = (event.target as HTMLInputElement | HTMLSelectElement);
    let value: string | number = target.value;

    this.editingContact.update(contact => {
      if (!contact) return contact;
      
      if (field === 'idCliente') {
          // Si el campo es idCliente, actualizamos el ID y también el nombre de la empresa
          const newId = Number(value);
          contact.idCliente = newId;
          contact.empresa = this.getClienteNameById(newId); // Asignar nombre de cliente a 'empresa' (cargo)
      } else if (['id', 'idUsuario'].includes(field as string)) {
          (contact as any)[field] = Number(value);
      } else {
          (contact as any)[field] = value; 
      }
      return contact;
    });
  }

  /**
   * Guarda los cambios vía el servicio (Creación o Actualización).
   */
  async saveContactChanges(): Promise<void> {
    const updatedContact = this.editingContact();
    
    // Validación para asegurar que se seleccionó un cliente
    if (updatedContact && updatedContact.idCliente <= 0) {
        this.error.set("Por favor, selecciona un Cliente válido para el contacto.");
        return;
    }

    // Aseguramos que 'empresa' esté actualizado con el nombre del cliente antes de enviar
    if (updatedContact) {
        updatedContact.empresa = this.getClienteNameById(updatedContact.idCliente);
    }
    
    if (updatedContact) {
      this.isLoading.set(true);
      this.error.set(null); // Limpiar error antes de intentar guardar

      const errorMessage = await this.contactoService.saveContact(updatedContact);
      
      if (errorMessage) {
        this.error.set(errorMessage);
        this.isLoading.set(false);
        return; 
      }
      
      // Mostrar notificación de éxito
      const isNew = updatedContact.id === 0;
      this.confirmationMessage.set(
        isNew 
          ? `Contacto "${updatedContact.nombre}" creado con éxito.`
          : `Contacto "${updatedContact.nombre}" actualizado con éxito.`
      );
    } else {
      console.error("No hay contacto para guardar.");
    }
    this.isLoading.set(false);
    this.closeEditModal();
  }

  // ******************************************************
  // LÓGICA DE CONFIRMACIÓN DE ELIMINACIÓN (Reemplazo de window.confirm)
  // ******************************************************

  /**
   * Prepara y abre el modal de confirmación de eliminación.
   */
  confirmDelete(id: number, nombre: string): void {
    this.contactToDelete.set({ id, nombre });
    this.showDeleteConfirm.set(true);
    this.closeEditModal(); // Cerrar el modal de edición si está abierto
  }

  /**
   * Cancela la eliminación y cierra el modal de confirmación.
   */
  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.contactToDelete.set(null);
  }

  /**
   * Ejecuta la eliminación después de la confirmación.
   */
  async executeDelete(): Promise<void> {
    const contact = this.contactToDelete();
    if (contact) {
      await this.deleteContact(contact.id);
    }
    this.cancelDelete();
  }

  /**
   * Elimina un contacto vía el servicio.
   */
  async deleteContact(id: number): Promise<void> {
    this.isDeleting.set(true);
    this.error.set(null);

    const errorMessage = await this.contactoService.deleteContact(id);

    if (errorMessage) {
      this.error.set(errorMessage);
      this.confirmationMessage.set(`ERROR: No se pudo eliminar el contacto.`);
    } else {
      const contact = this.contactToDelete();
      this.confirmationMessage.set(
        contact ? `Contacto "${contact.nombre}" (ID: ${contact.id}) eliminado con éxito.` 
                : `Contacto eliminado con éxito.`
      );
    }
    this.isDeleting.set(false);
  }
}