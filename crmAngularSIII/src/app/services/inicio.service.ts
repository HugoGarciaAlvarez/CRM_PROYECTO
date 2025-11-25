import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// Tipos locales (No exportados) para el servicio mock
// Estos tipos DEBEN coincidir con los definidos en inicio.component.ts
interface ClienteReciente {
  nombre: string;
  estado: string;
  ultimoContacto: string;
}

interface DashboardData {
  nombre: string;
  tareasFaltantes: number;
  incidenciasTramite: number;
  incidenciasActivas: number;
  clientesRecientes: ClienteReciente[];
  ventasMensuales: number[];
  leadsPorEstado: number[];
}

/**
 * Servicio de Inicio: Simula la obtención de datos del dashboard usando Observable y latencia.
 * Las interfaces se definen en inicio.component.ts.
 */
@Injectable({
  providedIn: 'root'
})
export class InicioService {
  
  /** Simula la obtención de datos del dashboard con latencia. */
  obtenerDashboard(): Observable<DashboardData> {
    const datosMock: DashboardData = {
      nombre: 'Jefe',
      tareasFaltantes: 7,
      incidenciasTramite: 3,
      incidenciasActivas: 1,
      clientesRecientes: [
        { nombre: 'Tech Solutions Corp.', estado: 'Activo', ultimoContacto: '2025-11-15' },
        { nombre: 'Global Logistics SRL', estado: 'Pendiente', ultimoContacto: '2025-11-18' },
        { nombre: 'Marketing Digital Pro', estado: 'Inactivo', ultimoContacto: '2025-11-10' },
      ],
      ventasMensuales: [1200, 1900, 3000, 5000, 2500, 3500],
      leadsPorEstado: [40, 30, 30]
    };

    // Retorna los datos como un Observable con un retraso de 1.5 segundos
    return of(datosMock).pipe(delay(1500));
  }
}