import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Cliente {
  nombre: string;
  correo: string;
  telefono: string;
}

export interface Notificacion {
  mensaje: string;
  fecha: string;
}

export interface DatosInicio {
  totalUsuarios: number;
  totalClientes: number;
  ventasMes: number;
  clientesRecientes: Cliente[];
  notificaciones: Notificacion[];
}

@Injectable({
  providedIn: 'root'
})
export class InicioService {
  private datosSubject = new BehaviorSubject<DatosInicio | null>(null);
  datos$: Observable<DatosInicio | null> = this.datosSubject.asObservable();

  constructor() {}

  async fetchDatos(): Promise<void> {
    const datosSimulados = await this.simularGet();
    this.datosSubject.next(datosSimulados);
  }

  private async simularGet(): Promise<DatosInicio> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          totalUsuarios: 123,
          totalClientes: 45,
          ventasMes: 9800,
          clientesRecientes: [
            { nombre: 'Juan Pérez', correo: 'juan@example.com', telefono: '555-1234' },
            { nombre: 'María López', correo: 'maria@example.com', telefono: '555-5678' },
            { nombre: 'Carlos Ruiz', correo: 'carlos@example.com', telefono: '555-9012' }
          ],
          notificaciones: [
            { mensaje: 'Nuevo cliente agregado: Ana Gómez', fecha: '2025-11-18' },
            { mensaje: 'Venta de $500 realizada', fecha: '2025-11-17' },
            { mensaje: 'Recordatorio de reunión con Juan Pérez', fecha: '2025-11-16' }
          ]
        });
      }, 1500);
    });
  }
}
