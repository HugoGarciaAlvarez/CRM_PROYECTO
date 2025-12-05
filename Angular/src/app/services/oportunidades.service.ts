import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs'; 

// Tipos para la API (Backend Enum values)
export type StageApi = 'PROSPECCION' | 'CALIFICACION' | 'PROPUESTA' | 'NEGOCIACION' | 'CERRADA_GANADA' | 'CERRADA_PERDIDA';

// Mapeo de la etiqueta de la UI al valor esperado por la API (el Enum en mayúsculas)
export const STAGE_MAPPING: { [key: string]: StageApi } = {
  'Prospección': 'PROSPECCION',
  'Calificación': 'CALIFICACION',
  'Propuesta': 'PROPUESTA',
  'Negociación': 'NEGOCIACION',
  'Cerrada Ganada': 'CERRADA_GANADA',
  'Cerrada Perdida': 'CERRADA_PERDIDA',
};

// Interfaz para la Oportunidad (más cercana al DTO que espera el backend)
export interface Opportunity {
  id: string | null; // El ID ahora puede ser null para la creación
  name: string;
  client: string; 
  idCliente?: number | null; 
  idUsuario?: number | null;
  stage: 'Prospección' | 'Calificación' | 'Propuesta' | 'Negociación' | 'Cerrada Ganada' | 'Cerrada Perdida';
  amount: number;
  startDate: string;
  closeDate: string;
}

// Array con los valores de display (para el <select> en el HTML)
export const STAGES_DISPLAY: Opportunity['stage'][] = [
  'Prospección', 'Calificación', 'Propuesta', 'Negociación', 'Cerrada Ganada', 'Cerrada Perdida'
];

@Injectable({ providedIn: 'root' })
export class OportunidadesService {
  private baseUrl = 'http://localhost:8080/oportunidades';
  public opportunities = signal<Opportunity[]>([]);
  public isLoading = signal(true);
  public isSaving = signal(false);

  constructor(private http: HttpClient) {}

  // Función de mapeo auxiliar para enviar a la API
  private mapToApiFormat(data: Opportunity) {
    const apiStage = STAGE_MAPPING[data.stage];
    const finalStage = apiStage ? apiStage : 'PROSPECCION'; 

    // El backend espera un DTO con idCliente, idUsuario y stage en mayúsculas
    return {
      id: data.id, // Incluimos el ID aquí para que el DTO del backend lo reciba
      name: data.name,
      stage: finalStage,
      amount: data.amount,
      startDate: data.startDate,
      closeDate: data.closeDate,
      
      // Enviamos los IDs de relación
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
    // Para la creación, el ID se ignora aquí y se genera en el backend.
    const dataToSend = this.mapToApiFormat(data); 
    try {
      const created = await lastValueFrom(this.http.post<any>(this.baseUrl, dataToSend)); 
      this.opportunities.update(curr => [created as Opportunity, ...curr]);
    } catch (err) {
      console.error('Error al crear oportunidad', err);
      throw err;
    } finally {
      this.isSaving.set(false);
    }
  }

  async updateOpportunity(id: string, data: Opportunity) {
    this.isSaving.set(true);
    // data.id debe coincidir con el id de la URL (lo aseguramos en el componente)
    const dataToSend = this.mapToApiFormat(data); 
    try {
      // URL: http://localhost:8080/oportunidades/{id}
      const updated = await lastValueFrom(this.http.put<any>(`${this.baseUrl}/${id}`, dataToSend));
      this.opportunities.update(curr => curr.map(o => o.id === id ? updated as Opportunity : o));
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

  // === Computed Signals & Utils remain the same ===
  public totalPipelineAmount = computed(() => this.opportunities()
    .filter(o => o.stage !== 'Cerrada Perdida')
    .reduce((sum, o) => sum + o.amount, 0)
  );

  public activeOpportunitiesCount = computed(() =>
    this.opportunities().filter(o => o.stage !== 'Cerrada Ganada' && o.stage !== 'Cerrada Perdida').length
  );

  public winRate = computed(() => {
    const totalClosed = this.opportunities().filter(o => o.stage.startsWith('Cerrada')).length;
    const closedWon = this.opportunities().filter(o => o.stage === 'Cerrada Ganada').length;
    return totalClosed === 0 ? 'N/A' : ((closedWon / totalClosed) * 100).toFixed(1) + '%';
  });

  public stats = computed(() => [
    { title: 'Total Pipeline', value: this.formatCurrency(this.totalPipelineAmount()) },
    { title: 'Oportunidades Activas', value: this.activeOpportunitiesCount() },
    { title: 'Oportunidades Ganadas', value: this.opportunities().filter(o => o.stage === 'Cerrada Ganada').length },
    { title: 'Tasa de Éxito', value: this.winRate() },
  ]);

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  }

  formatDate(date: string): string {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) { return 'N/A'; }
    return dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getStageBadgeClass(stage: Opportunity['stage']): string {
    const base = 'badge '; 
    switch (stage) {
      case 'Cerrada Ganada': return base + 'bg-green-100 text-green-800';
      case 'Cerrada Perdida': return base + 'bg-red-100 text-red-800';
      case 'Prospección': case 'Calificación': return base + 'bg-yellow-100 text-yellow-800';
      case 'Propuesta': case 'Negociación': return base + 'bg-blue-100 text-blue-800';
      default: return base + 'bg-gray-100 text-gray-800';
    }
  }
}