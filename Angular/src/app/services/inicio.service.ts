import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz para la entidad Tarea simplificada
export interface TareaDTO {
    idTarea: number;
    nombreCliente: string | null;
    titulo: string;
    descripcion: string;
    // Tipos de estado y prioridad ajustados a la entrada JSON
    estado: 'PENDIENTE' | 'EN PROGRESO' | 'COMPLETADA'; 
    prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
    fechaVencimiento: string;
    idUsuario: number;
    idCliente: number | null;
}

export interface ClienteReciente {
  nombre: string;
  estado: string;
  // Cambiado: Ahora contendrá el email del cliente
  ultimoContacto: string; 
}

// Interfaz que refleja el DTO FINAL que envía el backend
export interface DashboardData {
  // Datos Generales
  ingresosTotales: number;
  clientesActivos: number; 
  
  // Lista de Tareas (para que el frontend haga sus propios cálculos de KPIs)
  tareas: TareaDTO[];
  
  // Datos de gráficas
  ventasMensuales: { [key: string]: number };
  
  // Lista de Clientes mapeada
  clientesRecientes: ClienteReciente[]; 
}

@Injectable({
  providedIn: 'root'
})
export class InicioService {
  private apiUrl = 'http://localhost:8080/dashboard';

  constructor(private http: HttpClient) {}

  obtenerDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/inicio`);
  }
}