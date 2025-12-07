// src/app/components/actividades/actividades.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ActividadesService } from '..//services/actividades.service'; 
import { ClientesService, Cliente } from '..//services/clientes.service'; 

// =======================================================
// 1. DEFINICIÓN DE INTERFACES (SIMPLIFICADA)
// =======================================================

interface TareaDTO {
  idTarea: number;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: string; 
  fechaVencimiento: string; 
  nombreCliente: string | null;
  idUsuario: number;
  idCliente: number | null; 
  idIncidencia: number | null;
}

interface Incidencia {
    idIncidencia: number;
    descripcion: string;
    estado: string;
    prioridad: string;
    fechaApertura: string; 
}

/** Interfaz Adaptada para la Tarjeta HTML */
interface ActivityCard extends TareaDTO {
  id: number; 
  type: string; 
  subject: string; 
  contact: string; 
  status: string; 
  priority: string; 
  dueDate: string; 
}


// =======================================================
// 2. COMPONENTE ANGULAR (Lógica de Mapeo y Ordenamiento)
// =======================================================

@Component({
  selector: 'app-actividades', 
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './actividades.component.html',
  styleUrls: ['./actividades.component.css']
})
export class ActividadesComponent implements OnInit {
  
  // --- SIGNALS DE ESTADO ---
  activities = signal<ActivityCard[]>([]);
  isLoading = signal(true);
  clientesLookup = signal<Cliente[]>([]); 
  
  // Modales
  isCreateModalOpen = signal(false);
  isEditModalOpen = signal(false);
  isDetailsModalOpen = signal(false); 
  showDeleteConfirmation = signal(false);
  activityToDelete = signal<ActivityCard | null>(null);
  isDeleting = signal(false);
  
  // Data para modales
  newActivity = signal<Partial<TareaDTO>>({
    idUsuario: 1, 
    titulo: '', 
    descripcion: '',
    prioridad: 'MEDIA',
    fechaVencimiento: new Date().toISOString().substring(0, 10),
    estado: 'PENDIENTE',
    idCliente: null 
  });
  editingActivity = signal<ActivityCard | null>(null);
  incidenciaDetalle = signal<Incidencia | null>(null);

  constructor(
    private actividadesService: ActividadesService,
    private clientesService: ClientesService 
  ) { } 

  ngOnInit(): void {
    this.loadClientes(); 
    this.loadActivities();
  }
  
  // --- CARGA DE DATOS (Ordenamiento Integrado) ---

  loadClientes(): void {
    this.clientesService.getClientes()
      .then(clientes => {
        this.clientesLookup.set(clientes);
      })
      .catch(err => {
        console.error('Error al cargar la lista de clientes:', err);
      });
  }

  loadActivities(): void {
    this.isLoading.set(true);
    this.actividadesService.getTareas().subscribe({ 
      next: (data: TareaDTO[]) => { 
        let activities = data.map(t => this.mapToActivityCard(t));
        
        // 🚨 INTEGRACIÓN DEL ORDENAMIENTO
        activities = this.sortActivitiesByPriority(activities); 
        
        this.activities.set(activities);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar actividades', err);
        this.isLoading.set(false);
      }
    });
  }

  // --- 🚨 MÉTODO DE ORDENAMIENTO POR PRIORIDAD 🚨 ---
  /** * Ordena las actividades: ALTA (1) > MEDIA (2) > BAJA (3). 
   * Como criterio secundario, ordena por fecha de vencimiento (más antigua primero).
   */
  private sortActivitiesByPriority(activities: ActivityCard[]): ActivityCard[] {
    const priorityOrder: { [key: string]: number } = {
        'ALTA': 1,
        'MEDIA': 2,
        'BAJA': 3,
    };

    // Usamos el método slice() para crear una copia del array antes de ordenar, 
    // asegurando que no mutamos accidentalmente el array original de la señal.
    return activities.slice().sort((a, b) => {
        const priorityA = priorityOrder[a.priority.toUpperCase()] || 99;
        const priorityB = priorityOrder[b.priority.toUpperCase()] || 99;

        // 1. Criterio principal: Prioridad (ALTA primero)
        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }

        // 2. Criterio secundario: Fecha de Vencimiento (más cercana primero)
        if (a.dueDate && b.dueDate) {
            const dateA = new Date(a.dueDate).getTime();
            const dateB = new Date(b.dueDate).getTime();
            return dateA - dateB;
        }
        
        // 3. Criterio terciario: ID (por estabilidad)
        return a.id - b.id; 
    });
  }


  // --- ADAPTACIÓN DE DATOS (Mapeo Bidireccional) ---

  /** Mapea el DTO de Spring (TareaDTO) a la Tarjeta de Angular (ActivityCard) */
  private mapToActivityCard(tarea: TareaDTO): ActivityCard {
    return {
      ...tarea,
      id: tarea.idTarea,
      type: 'Tarea', 
      subject: tarea.titulo, 
      contact: tarea.nombreCliente || 'Sin Cliente', 
      status: tarea.estado,
      priority: tarea.prioridad, 
      dueDate: tarea.fechaVencimiento, 
    };
  }

  /** Mapea la Tarjeta de Angular (activity: ActivityCard) de vuelta al DTO de Spring (TareaDTO) */
  private mapToTareaDTO(activity: Partial<ActivityCard>): TareaDTO {
    const act = activity as ActivityCard; 
    
    const clienteIdNum = act.idCliente === 0 || act.idCliente === null || act.idCliente === undefined
        ? null
        : Number(act.idCliente); 

    return {
        idTarea: act.id || 0, 
        titulo: act.subject || act.titulo || '', 
        descripcion: act.descripcion || '',
        estado: act.status || act.estado || 'PENDIENTE',
        
        prioridad: act.priority || act.prioridad || 'MEDIA', 
        
        fechaVencimiento: act.dueDate || act.fechaVencimiento || new Date().toISOString().substring(0, 10),
        
        nombreCliente: null, 
        
        idUsuario: act.idUsuario || 1, 
        idCliente: clienteIdNum, 
        idIncidencia: act.idIncidencia || null,
        
    } as TareaDTO;
  }

  // --- MÉTODOS DE MANEJO DE FORMULARIO ---

  /** Actualiza la señal newActivity con el valor del formulario */
  updateNewActivity(field: keyof TareaDTO, value: any): void { 
    this.newActivity.update(a => {
        const updated: Partial<TareaDTO> = { ...a };
        
        if (field === 'idCliente') {
            updated.idCliente = value ? Number(value) : null;
        } 
        else if (field === 'idUsuario') {
            updated.idUsuario = value ? Number(value) : 1; 
        }
        else {
             (updated as any)[field] = value;
        }
        return updated;
    });
  }
  
  /** Actualiza la señal editingActivity con el valor del formulario (Edición) */
  updateEditActivity(field: keyof ActivityCard, value: any): void { 
    this.editingActivity.update(a => {
      if (!a) return null;
      const updated: Partial<ActivityCard> = { ...a };
      
      if (field === 'idCliente') {
          updated.idCliente = value ? Number(value) : null;
      } 
      else if (field === 'subject') {
          updated.subject = value;
          updated.titulo = value; 
      } else if (field === 'priority') {
          updated.priority = value;
          updated.prioridad = value as any; 
      } else if (field === 'status') {
          updated.status = value;
          updated.estado = value; 
      } else {
           (updated as any)[field] = value;
      }
      return updated as ActivityCard;
    });
  }
  
  // --- MÉTODOS CRUD ---

  addActivity(): void {
    const tareaRequest = this.mapToTareaDTO(this.newActivity());
    
    this.actividadesService.createTarea(tareaRequest).subscribe({
      next: (newTarea) => {
        // Agregamos la nueva actividad y reordenamos
        const newCard = this.mapToActivityCard(newTarea);
        let updatedActivities = [...this.activities(), newCard];
        this.activities.set(this.sortActivitiesByPriority(updatedActivities));
        
        this.closeCreateModal(); 
      },
      error: (err) => console.error('Error al crear actividad', err)
    });
  }

  saveEdit(): void {
    const activity = this.editingActivity();
    if (!activity) return;

    const tareaRequest = this.mapToTareaDTO(activity);
    
    this.actividadesService.updateTarea(activity.id, tareaRequest).subscribe({
      next: (updatedTarea) => {
        const updatedCard = this.mapToActivityCard(updatedTarea);
        
        // Actualizamos el array y reordenamos
        let updatedActivities = this.activities().map(a => 
            a.id === updatedCard.id ? updatedCard : a
        );
        this.activities.set(this.sortActivitiesByPriority(updatedActivities));
        
        this.closeEditModal(); 
      },
      error: (err) => console.error('Error al actualizar actividad', err)
    });
  }

  prepararEliminacion(activity: ActivityCard): void {
    this.activityToDelete.set(activity);
    this.showDeleteConfirmation.set(true);
  }

  cancelarEliminacion(): void {
    if (this.isDeleting()) return;
    this.activityToDelete.set(null);
    this.showDeleteConfirmation.set(false);
  }

  confirmarEliminacion(): void {
    const activity = this.activityToDelete();
    if (!activity) return;

    this.isDeleting.set(true);
    this.actividadesService.deleteTarea(activity.id).subscribe({
      next: () => {
        this.activities.update(arr => arr.filter(a => a.id !== activity.id));
        this.isDeleting.set(false);
        this.cancelarEliminacion();
      },
      error: (err) => {
        console.error('Error al eliminar actividad', err);
        this.isDeleting.set(false);
      }
    });
  }

  markAsComplete(id: number): void {
    const activity = this.activities().find(a => a.id === id);
    if (!activity) return;

    const completedActivity = { 
      ...activity, 
      status: 'COMPLETADA', 
      estado: 'COMPLETADA' 
    } as ActivityCard;
    
    const tareaRequest = this.mapToTareaDTO(completedActivity);

    this.actividadesService.updateTarea(id, tareaRequest).subscribe({
      next: (updatedTarea) => {
        const updatedCard = this.mapToActivityCard(updatedTarea);
        
        // Actualizamos el array y reordenamos
        let updatedActivities = this.activities().map(a => 
            a.id === updatedCard.id ? updatedCard : a
        );
        this.activities.set(this.sortActivitiesByPriority(updatedActivities));
      },
      error: (err) => console.error('Error al completar actividad', err)
    });
  }
  
  // --- MÉTODOS DE MODALES ---

  verDetallesIncidencia(idIncidencia: number | null): void {
    if (!idIncidencia) {
      alert('Esta tarea no tiene una incidencia asociada.');
      return;
    }

    this.actividadesService.getIncidenciaDetails(idIncidencia).subscribe({ 
      next: (incidencia: Incidencia) => { 
        this.incidenciaDetalle.set(incidencia);
        this.isDetailsModalOpen.set(true); 
      },
      error: (err) => {
        console.error('Error al cargar la incidencia', err);
        alert('No se pudieron cargar los detalles de la incidencia.');
      }
    });
  }

  openCreateModal(): void {
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
    // Reiniciar el formulario
    this.newActivity.set({
      idUsuario: 1, 
      titulo: '', 
      descripcion: '',
      prioridad: 'MEDIA',
      fechaVencimiento: new Date().toISOString().substring(0, 10),
      estado: 'PENDIENTE',
      idCliente: null
    });
  }

  openEditModal(activity: ActivityCard): void {
    if (activity.idIncidencia) {
        // Si tiene incidencia, solo mostramos los detalles
        this.verDetallesIncidencia(activity.idIncidencia);
    } else {
        // Si no tiene incidencia, abrimos el modal de edición normal
        this.editingActivity.set({ 
            ...activity, 
            // Esto asegura que el campo fecha de vencimiento se inicialice correctamente en el input type="date"
            dueDate: this.formatDateForInput(activity.dueDate) 
        }); 
        this.isEditModalOpen.set(true);
    }
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
    this.editingActivity.set(null);
  }
  
  closeDetailsModal(): void {
    this.isDetailsModalOpen.set(false);
    this.incidenciaDetalle.set(null);
  }

  // --- MÉTODOS DE ESTILO Y FORMATO ---

  getCardClasses(status: string): string { 
    switch (status.toUpperCase()) {
      case 'COMPLETADA': return 'bg-green-50 border-green-300';
      case 'PENDIENTE': return 'bg-red-50 border-red-300';
      case 'EN PROGRESO': return 'bg-yellow-50 border-yellow-300';
      default: return 'bg-white border-gray-200';
    }
  }

  getPriorityColor(priority: string): string { 
    switch (priority.toUpperCase()) {
      case 'ALTA': return 'bg-red-600';
      case 'MEDIA': return 'bg-yellow-500';
      case 'BAJA': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  }

  getIconColor(type: string): string { return 'bg-indigo-100 text-indigo-600'; }
  getIcon(type: string): string { return '📝'; }

  /** Formatea la cadena de fecha a 'yyyy-MM-dd' para inputs de tipo date */
  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    return dateString.substring(0, 10);
  }
}