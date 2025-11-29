// contactos.component.ts
import { ChangeDetectionStrategy, Component, signal, OnInit, inject, computed } from '@angular/core';
import { ContactoService, Contacto } from '../services/contacto.service'; // Importamos la interfaz y el servicio

@Component({
  selector: 'app-contactos', 
  standalone: true,
  templateUrl: './contactos.component.html', 
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactosComponent implements OnInit {
  // Inyección del servicio
  private contactoService = inject(ContactoService);

  // Exposición del signal de contactos desde el servicio
  public contacts = this.contactoService.contacts;

  // Estado de la UI
  public isLoading = signal(true);
  public error = signal<string | null>(null);

  // Signals para manejar el estado de búsqueda y filtro
  public searchTerm = signal('');
  public filterStatus = signal<Contacto['estado'] | 'Todos'>('Todos');

  // Modal State
  public isModalOpen = signal(false);
  public editingContact = signal<Contacto | null>(null);

  ngOnInit() {
    this.cargarContactos();
  }

  // ******************************************************
  // DATA MANIPULATION AND FILTERING
  // ******************************************************

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

      // 2. Filtrado por Término de Búsqueda (Nombre, Email o Empresa)
      const searchMatch = 
        contact.nombre.toLowerCase().includes(term) ||
        contact.email.toLowerCase().includes(term) ||
        contact.empresa.toLowerCase().includes(term);

      return statusMatch && searchMatch;
    });
  });

  /**
   * Llama al servicio para cargar los contactos y gestiona los estados de carga y error.
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
    const newContact: Contacto = {
        id: -Date.now(), 
        nombre: '', email: '', telefono: '', empresa: '', estado: 'Potencial' 
    };
    this.editingContact.set(newContact);
    this.isModalOpen.set(true);
  }

  /**
   * Cierra el modal.
   */
  closeEditModal(): void {
    this.isModalOpen.set(false);
    this.editingContact.set(null);
  }

  /**
   * Actualiza un campo del contacto que se está editando en el signal local.
   */
  updateEditingContact(field: keyof Contacto, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLSelectElement).value;

    this.editingContact.update(contact => {
      if (contact) {
        (contact as any)[field] = value; 
      }
      return contact;
    });
  }

  /**
   * Guarda los cambios vía el servicio.
   */
  saveContactChanges(): void {
    const updatedContact = this.editingContact();
    if (updatedContact) {
      this.contactoService.saveContact(updatedContact);
    } else {
      console.error("No hay contacto para guardar.");
    }
    this.closeEditModal();
  }
}