import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
// Importamos el servicio, asumiendo que está en './clientes.service'
import { ClientesService } from '../services/clientes.service';

// 1. INTERFACES (Definidas en el componente)
interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  fechaRegistro: string; 
  estado: 'Activo' | 'Inactivo' | 'Pendiente';
}

interface NuevoCliente {
  nombre: string;
  email: string;
  telefono: string;
  estado: 'Activo' | 'Inactivo' | 'Pendiente';
}

// Función auxiliar (Lógica visual)
function getEstadoClasses(estado: Cliente['estado']): string {
  switch (estado) {
    case 'Activo':
      return 'bg-emerald-100 text-emerald-800 ring-emerald-600/20';
    case 'Inactivo':
      return 'bg-red-100 text-red-800 ring-red-600/20';
    case 'Pendiente':
      return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
    default:
      return 'bg-gray-100 text-gray-800 ring-gray-600/20';
  }
}

@Component({
  selector: 'app-clientes', 
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe], 
  templateUrl: './clientes.component.html', 
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientesComponent { 
  
  constructor(private clientesService: ClientesService) { 
    this.fetchClientes();
  }
  
  // GESTIÓN DE ESTADO (Signals)
  public clientes = signal<Cliente[]>([]);
  public isLoading = signal(false);
  public error = signal<string | null>(null);

  // Filtros
  public searchTerm = signal('');
  public filterStatus = signal<'Todos' | Cliente['estado']>('Todos');

  // Modales y formularios
  public showModal = signal(false); 
  public selectedClient = signal<Cliente | null>(null); 
  public isSubmitting = signal(false);
  public isUpdating = signal(false);
  public formError = signal<string | null>(null);
  public confirmationMessage = signal<string | null>(null);

  public newClientForm: NuevoCliente = {
      nombre: '', email: '', telefono: '', estado: 'Activo'
  };

  // LÓGICA DE FILTRADO (computed)
  public filteredClientes = computed(() => {
    let list = this.clientes();
    const term = this.searchTerm().toLowerCase();
    const status = this.filterStatus();

    list = list.filter(cliente => {
      return cliente.nombre.toLowerCase().includes(term) ||
             cliente.email.toLowerCase().includes(term);
    });

    if (status !== 'Todos') {
      list = list.filter(cliente => cliente.estado === status);
    }
    
    return list;
  });

  public getEstadoClasses = getEstadoClasses; 

 
  
  /** Maneja la entrada del campo de búsqueda de manera segura. */
  public handleSearchInput(event: Event): void {
    // Casting seguro y comprobación de nulidad para obtener el valor.
    const value = (event.target as HTMLInputElement)?.value || '';
    this.searchTerm.set(value);
  }

  /** Maneja el cambio en el select de estado de manera segura. */
  public handleStatusChange(event: Event): void {
    // Casting seguro al tipo Select y a los estados definidos.
    const value = (event.target as HTMLSelectElement)?.value as 'Todos' | Cliente['estado'];
    this.filterStatus.set(value);
  }

  // MÉTODOS CRUD

  /** Carga la lista de clientes. */
  public async fetchClientes(force: boolean = false): Promise<void> {
    if (this.isLoading() && !force) { return; }
    this.isLoading.set(true);
    this.error.set(null); 
    try {
      const data = await this.clientesService.getClientes();
      this.clientes.set(data);
    } catch (err) {
      this.error.set('Error al cargar los datos.');
    } finally {
      this.isLoading.set(false);
    }
  }

  /** Añade un nuevo cliente. */
  public async submitNewClient(): Promise<void> {
    if (this.isSubmitting() || !this.newClientForm.nombre) return;
    this.isSubmitting.set(true);
    this.formError.set(null);
    try {
        const nuevoCliente = await this.clientesService.createCliente(this.newClientForm);
        this.clientes.update(currentClients => [...currentClients, nuevoCliente]);
        this.confirmationMessage.set(`Cliente "${nuevoCliente.nombre}" añadido con éxito.`);
        this.showModal.set(false);
        this.resetNewClientForm();
    } catch (error) {
        this.formError.set('Error al guardar el cliente.');
    } finally {
        this.isSubmitting.set(false);
    }
  }

  /** Abre el modal de edición/detalle (clonando el objeto). */
  public verDetalle(cliente: Cliente): void {
      this.selectedClient.set({ ...cliente }); 
  }

  /** Actualiza un cliente existente. */
  public async actualizarCliente(): Promise<void> {
      const clientToUpdate = this.selectedClient();
      if (!clientToUpdate) return;
      this.isUpdating.set(true);
      try {
          const updatedClient = await this.clientesService.updateCliente(clientToUpdate);
          this.clientes.update(currentClients => 
              currentClients.map(c => c.id === updatedClient.id ? updatedClient : c)
          );
          this.confirmationMessage.set(`Cliente "${updatedClient.nombre}" actualizado con éxito.`);
          this.cerrarDetalle();
      } catch (error) {
          this.confirmationMessage.set(`ERROR: No se pudo actualizar el cliente.`);
      } finally {
          this.isUpdating.set(false);
      }
  }
  
  /** Cierra el modal de edición. */
  public cerrarDetalle(): void {
      this.selectedClient.set(null);
  }

  private resetNewClientForm(): void {
    this.newClientForm = { nombre: '', email: '', telefono: '', estado: 'Activo' };
  }
}