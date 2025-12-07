import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

// Tipos para la API (Backend Enum values)
export type StageApi = 'PROSPECCION' | 'CALIFICACION' | 'PROPUESTA' | 'NEGOCIACION' | 'CERRADA_GANADA' | 'CERRADA_PERDIDA';

// Interfaz para la Oportunidad
export interface Opportunity {
  id: string | null; // El ID ahora puede ser null para la creación
  name: string;
  idCliente?: number | null;
  idUsuario?: number | null;
  stage: StageApi;
  amount: number;
  startDate: string;
  closeDate: string;
}

// Array con los valores de display (para el <select> en el HTML)
export const STAGES_DISPLAY: Opportunity['stage'][] = [
  'PROSPECCION', 'CALIFICACION', 'PROPUESTA', 'NEGOCIACION', 'CERRADA_GANADA', 'CERRADA_PERDIDA'
];

@Injectable({ providedIn: 'root' })
export class OportunidadesService {
  private baseUrl = 'http://localhost:8080/oportunidades';
  public opportunities = signal<Opportunity[]>([]);
  public isLoading = signal(true);
  public isSaving = signal(false);

  constructor(private http: HttpClient) {}

  // Función auxiliar: ya no necesitamos mapear la etapa
  private mapToApiFormat(data: Opportunity) {
    return {
      id: data.id,
      name: data.name,
      stage: data.stage, // Ya está en el formato correcto
      amount: data.amount,
      startDate: data.startDate,
      closeDate: data.closeDate,
      idCliente: data.idCliente,
      idUsuario: data.idUsuario
    };
  }

  // === API HTTP ===
  loadOpportunities(): void {
    this.isLoading.set(true);
    lastValueFrom(this.http.get<Opportunity[]>(this.baseUrl))
      .then(data => this.opportunities.set(data))
      .catch(err => console.error('Error al cargar oportunidades', err))
      .finally(() => this.isLoading.set(false));
  }

  async createOpportunity(data: Opportunity) {
    this.isSaving.set(true);
    const dataToSend = this.mapToApiFormat(data); 
    try {
      const created = await lastValueFrom(this.http.post<Opportunity>(this.baseUrl, dataToSend));
      this.opportunities.update(curr => [created, ...curr]);
    } catch (err) {
      console.error('Error al crear oportunidad', err);
      throw err;
    } finally {
      this.isSaving.set(false);
    }
  }

  async updateOpportunity(id: string, data: Opportunity) {
    this.isSaving.set(true);
    const dataToSend = this.mapToApiFormat(data); 
    try {
      const updated = await lastValueFrom(this.http.put<Opportunity>(`${this.baseUrl}/${id}`, dataToSend));
      this.opportunities.update(curr => curr.map(o => o.id === id ? updated : o));
    } catch (err) {
      console.error('Error al actualizar oportunidad', err);
      throw err;
    } finally {
      this.isSaving.set(false);
    }
  }

  async deleteOpportunity(id: string) {
    this.isSaving.set(true);
    try {
      await lastValueFrom(this.http.delete(`${this.baseUrl}/${id}`));
      this.opportunities.update(curr => curr.filter(o => o.id !== id));
    } catch (err) {
      console.error('Error al eliminar oportunidad', err);
      throw err;
    } finally {
      this.isSaving.set(false);
    }
  }

  getOpportunityById(id: string): Opportunity | undefined {
    return this.opportunities().find(o => o.id === id);
  }

  // === Utils / Computed ===
  getStageBadgeClass(stage: Opportunity['stage']): string {
    const base = 'badge ';
    switch (stage) {
      case 'CERRADA_GANADA': return base + 'bg-green-100 text-green-800';
      case 'CERRADA_PERDIDA': return base + 'bg-red-100 text-red-800';
      case 'PROSPECCION': case 'CALIFICACION': return base + 'bg-yellow-100 text-yellow-800';
      case 'PROPUESTA': case 'NEGOCIACION': return base + 'bg-blue-100 text-blue-800';
      default: return base + 'bg-gray-100 text-gray-800';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  }

  formatDate(date: string): string {
    const dateObj = new Date(date);
    return isNaN(dateObj.getTime()) ? 'N/A' : dateObj.toLocaleDateString('es-ES');
  }
}
