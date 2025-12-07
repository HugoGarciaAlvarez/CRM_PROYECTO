// src/app/services/actividades.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Usamos 'any' en el servicio ya que las interfaces están definidas
// en el componente para simplificar.

@Injectable({
  providedIn: 'root'
})
export class ActividadesService {
  
  // URL base de la API de Spring Boot (apunta a /api/tareas)
  private apiUrl = 'http://localhost:8080/api/tareas'; 

  constructor(private http: HttpClient) { }

  // C - CREATE
  createTarea(tarea: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, tarea);
  }

  // R - READ ALL
  getTareas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  
  // U - UPDATE
  updateTarea(id: number, tarea: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, tarea);
  }

  // D - DELETE
  deleteTarea(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // DETALLE DE INCIDENCIA
  getIncidenciaDetails(idIncidencia: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/incidencia/${idIncidencia}`);
  }
}