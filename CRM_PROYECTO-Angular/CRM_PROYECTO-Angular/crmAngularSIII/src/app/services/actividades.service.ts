// actividades.service.ts

// Definiciones de interfaz para el contrato del servicio
interface Activity {
  id: number;
  type: 'Llamada' | 'Reunión' | 'Correo' | 'Tarea';
  subject: string;
  contact: string;
  dueDate: Date;
  status: 'Pendiente' | 'Completada' | 'En Progreso';
  priority: 'Alta' | 'Media' | 'Baja';
}

interface NewActivityForm {
  type: Activity['type'];
  subject: string;
  contact: string;
  priority: Activity['priority'];
  dueDate: string;
}


import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ActividadesService {
  private _activities = signal<Activity[]>([]);
  readonly activities = this._activities.asReadonly();

  private mockActivities: Activity[] = [
    { id: 1, type: 'Llamada', subject: 'Llamada de seguimiento a Juan Pérez sobre la propuesta A.', contact: 'Juan Pérez', dueDate: new Date(Date.now() + 86400000 * 2), status: 'Pendiente', priority: 'Alta' },
    { id: 2, type: 'Reunión', subject: 'Reunión de demostración de producto con el equipo de TI.', contact: 'María Gómez', dueDate: new Date(Date.now() + 86400000 * 5), status: 'En Progreso', priority: 'Media' },
    { id: 3, type: 'Correo', subject: 'Enviar cotización formal para el proyecto de expansión.', contact: 'Carlos Ruiz', dueDate: new Date(Date.now() - 86400000 * 1), status: 'Pendiente', priority: 'Alta' },
    { id: 4, type: 'Tarea', subject: 'Preparar la presentación trimestral de resultados.', contact: 'Gerencia', dueDate: new Date(Date.now() + 86400000 * 10), status: 'Completada', priority: 'Baja' },
  ];

  constructor() {
    this.fetchActivities();
  }

  fetchActivities(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        const sorted = this.sortActivities(this.mockActivities);
        this._activities.set(sorted);
        resolve();
      }, 1500);
    });
  }

  addActivity(newActivity: NewActivityForm): void {
    const activityToAdd: Activity = {
      id: Date.now(),
      dueDate: new Date(newActivity.dueDate),
      status: 'Pendiente',
      type: newActivity.type,
      subject: newActivity.subject,
      contact: newActivity.contact,
      priority: newActivity.priority,
    };

    this._activities.update(current => {
      const updated = [activityToAdd, ...current];
      return this.sortActivities(updated);
    });
  }

  updateActivity(editedActivity: Activity): void {
    this._activities.update(currentActivities => {
      const updated = currentActivities.map(activity =>
        activity.id === editedActivity.id ? editedActivity : activity
      );
      return this.sortActivities(updated);
    });
  }

  markAsComplete(id: number): void {
    this._activities.update(currentActivities => {
      const updated = currentActivities.map(activity => {
        if (activity.id === id) {
          // CORREGIDO: Usamos aserción de tipo literal para evitar el error TS2345
          return { ...activity, status: 'Completada' as Activity['status'] };
        }
        return activity;
      });
      return this.sortActivities(updated); 
    });
  }

  private sortActivities(currentActivities: Activity[]): Activity[] {
    const getStatusOrder = (status: Activity['status']): number => {
      switch (status) {
        case 'Pendiente': return 1;
        case 'En Progreso': return 2;
        case 'Completada': return 3;
        default: return 99;
      }
    };

    return [...currentActivities].sort((a, b) => {
      const orderA = getStatusOrder(a.status);
      const orderB = getStatusOrder(b.status);

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  }
}