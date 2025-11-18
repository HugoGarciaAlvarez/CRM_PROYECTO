import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface DashboardData {
  nombre: string;
  tareasFaltantes: number;
  incidenciasTramite: number;
  incidenciasActivas: number;
  ventasMensuales: number[];
  leadsPorEstado: number[];
  clientesRecientes: { nombre: string; estado: string; ultimoContacto: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class CrmService {
  obtenerDashboard(): Observable<DashboardData> {
    const data: DashboardData = {
      nombre: 'Juan',
      tareasFaltantes: 5,
      incidenciasTramite: 3,
      incidenciasActivas: 2,
      ventasMensuales: [12, 18, 14, 20, 22, 25],
      leadsPorEstado: [5, 3, 2],
      clientesRecientes: [
        { nombre: 'Empresa A', estado: 'Activo', ultimoContacto: '2025-11-16' },
        { nombre: 'Empresa B', estado: 'En seguimiento', ultimoContacto: '2025-11-15' },
        { nombre: 'Empresa C', estado: 'Inactivo', ultimoContacto: '2025-11-10' }
      ]
    };
    return of(data).pipe(delay(1500));
  }
}
