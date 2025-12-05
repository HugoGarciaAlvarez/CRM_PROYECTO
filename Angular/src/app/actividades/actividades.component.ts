// actividades.component.ts
import { ChangeDetectionStrategy, Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActividadesService } from '../services/actividades.service';

// Interfaz para definir la estructura de una actividad o tarea.
interface Activity {
  id: number;
  type: 'Llamada' | 'Reunión' | 'Correo' | 'Tarea';
  subject: string; // Asunto de la actividad
  contact: string; // Contacto relacionado
  dueDate: Date; // Fecha de vencimiento
  status: 'Pendiente' | 'Completada' | 'En Progreso'; // Estado de la actividad
  priority: 'Alta' | 'Media' | 'Baja'; // Prioridad
}

// Interfaz para el estado inicial del formulario de CREACIÓN
interface NewActivityForm {
    type: Activity['type'];
    subject: string;
    contact: string;
    priority: Activity['priority'];
    dueDate: string; // Usamos string para el input date en el formulario
}


@Component({
  selector: 'app-actividades',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe], 
  templateUrl: './actividades.component.html',
  styleUrls: ['./actividades.component.css'], 
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActividadesComponent implements OnInit {
  private actividadesService = inject(ActividadesService);

  readonly activities = this.actividadesService.activities;
  isLoading = signal<boolean>(true);

  isCreateModalOpen = signal<boolean>(false);
  newActivity = signal<NewActivityForm>({
    type: 'Llamada',
    subject: '',
    contact: '',
    priority: 'Media',
    dueDate: this.formatDateForInput(new Date()),
  });

  isEditModalOpen = signal<boolean>(false);
  editingActivity = signal<Activity | null>(null);

  ngOnInit(): void {
    this.actividadesService.fetchActivities().then(() => {
        this.isLoading.set(false);
    });
  }

  // --- LÓGICA DE MODALES Y ACCIONES ---

  openCreateModal(): void {
    this.isCreateModalOpen.set(true);
    this.resetNewActivityForm(); 
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
    this.resetNewActivityForm();
  }

  addActivity(): void {
    const form = this.newActivity();

    if (!form.subject || !form.contact || !form.dueDate) {
      console.error("Asunto, Contacto y Fecha de Vencimiento son obligatorios.");
      return;
    }
    
    this.actividadesService.addActivity(form);
    this.closeCreateModal();
  }

  openEditModal(activity: Activity): void {
    this.editingActivity.set({ ...activity }); 
    this.isEditModalOpen.set(true);
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
    this.editingActivity.set(null);
  }

  saveEdit(): void {
    const edited = this.editingActivity();
    if (!edited || !edited.subject || !edited.contact) {
        console.error("Los campos obligatorios no deben estar vacíos.");
        return;
    }
    
    this.actividadesService.updateActivity(edited);
    this.closeEditModal();
  }

  markAsComplete(id: number): void {
    this.actividadesService.markAsComplete(id);
  }
  
  // --- MÉTODOS DE ACTUALIZACIÓN DE SIGNALS (FORMULARIOS) ---
  
  private resetNewActivityForm(): void {
      this.newActivity.set({
        type: 'Llamada',
        subject: '',
        contact: '',
        priority: 'Media',
        dueDate: this.formatDateForInput(new Date()),
      });
  }

  // CREACIÓN
  updateType(value: string): void {
    this.newActivity.update(a => ({ ...a, type: value as Activity['type'] }));
  }
  updateSubject(value: string): void {
    this.newActivity.update(a => ({ ...a, subject: value }));
  }
  updateContact(value: string): void {
    this.newActivity.update(a => ({ ...a, contact: value }));
  }
  updatePriority(value: string): void {
    this.newActivity.update(a => ({ ...a, priority: value as Activity['priority'] }));
  }
  updateDueDate(value: string): void {
    this.newActivity.update(a => ({ ...a, dueDate: value }));
  }

  // EDICIÓN
  updateEditType(value: string): void {
    this.editingActivity.update(a => (a ? { ...a, type: value as Activity['type'] } : null));
  }
  updateEditSubject(value: string): void {
    this.editingActivity.update(a => (a ? { ...a, subject: value } : null));
  }
  updateEditContact(value: string): void {
    this.editingActivity.update(a => (a ? { ...a, contact: value } : null));
  }
  updateEditPriority(value: string): void {
    this.editingActivity.update(a => (a ? { ...a, priority: value as Activity['priority'] } : null));
  }
  updateEditStatus(value: string): void {
    this.editingActivity.update(a => (a ? { ...a, status: value as Activity['status'] } : null));
  }
  updateEditDueDate(value: string): void {
    this.editingActivity.update(a => (a ? { ...a, dueDate: new Date(value) } : null));
  }

  // --- MÉTODOS DE VISTA / HELPERS ---

  formatDateForInput(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
  }

  getCardClasses(status: Activity['status']): string {
    switch (status) {
      case 'Completada':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'En Progreso':
        return 'bg-yellow-50 border-l-4 border-yellow-500';
      case 'Pendiente':
      default:
        return 'bg-white border-l-4 border-indigo-500';
    }
  }

  getPriorityColor(priority: Activity['priority']): string {
    switch (priority) {
      case 'Alta':
        return 'bg-red-500';
      case 'Media':
        return 'bg-yellow-500';
      case 'Baja':
        return 'bg-blue-400';
    }
    return '';
  }

  getIcon(type: Activity['type']): string {
    switch (type) {
      case 'Llamada': return '📞';
      case 'Reunión': return '👥';
      case 'Correo': return '📧';
      case 'Tarea': return '📝';
    }
  }

  getIconColor(type: Activity['type']): string {
    switch (type) {
      case 'Llamada': return 'bg-blue-100 text-blue-600';
      case 'Reunión': return 'bg-purple-100 text-purple-600';
      case 'Correo': return 'bg-red-100 text-red-600';
      case 'Tarea': return 'bg-yellow-100 text-yellow-600';
    }
  }
}