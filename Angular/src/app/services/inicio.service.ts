import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClienteReciente {
  nombre: string;
  estado: string;
  // Cambiado: Ahora contendrá el email del cliente
  ultimoContacto: string; 
}

// Interfaz que refleja el DTO FINAL que envía el backend
export interface DashboardData {
  username: string; // Nuevo: Para la bienvenida
  
  // KPIs Calculados
  tareasFaltantes: number;
  incidenciasTramite: number;
  incidenciasActivas: number;
  
  // Datos Generales
  ingresosTotales: number;
  clientesActivos: number; 
  
  // Datos de gráficas
  // Nota: El backend envía esto como un mapa (objeto) donde la clave es "YYYY-MM"
  ventasMensuales: { [key: string]: number };
  leadsPorEstado: number[]; // [ALTA, MEDIA, BAJA]
  
  // Lista de Clientes mapeada
  clientesRecientes: ClienteReciente[]; 
  
  // Eliminadas: tareas, incidencias (no son necesarias en el componente de inicio)
}

@Injectable({
  providedIn: 'root'
})
export class InicioService {
  private apiUrl = 'http://localhost:8080/dashboard';

  constructor(private http: HttpClient) {}

  obtenerDashboard(): Observable<DashboardData> {
    // El tipo de retorno es DashboardData
    return this.http.get<DashboardData>(`${this.apiUrl}/inicio`);
  }
}