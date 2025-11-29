import { computed, Injectable, signal } from '@angular/core';

// Interfaz para el modelo de datos de Oportunidad
export interface Opportunity {
  id: string;
  name: string;
  client: string;
  stage: 'Prospección' | 'Calificación' | 'Propuesta' | 'Negociación' | 'Cerrada Ganada' | 'Cerrada Perdida';
  amount: number;
  startDate: string; // Fecha de inicio de la oportunidad
  closeDate: string; // Formato YYYY-MM-DD
}

// Lista de etapas disponibles para el formulario
export const STAGES: Opportunity['stage'][] = [
  'Prospección',
  'Calificación',
  'Propuesta',
  'Negociación',
  'Cerrada Ganada',
  'Cerrada Perdida',
];

@Injectable({
  providedIn: 'root',
})
export class OportunidadesService {
  // === ESTADO (SIGNALS) ===
  public opportunities = signal<Opportunity[]>([]);
  public isLoading = signal(true);
  public isSaving = signal(false);   // Estado de guardado/actualización

  // === DATOS SIMULADOS ===
  private mockOpportunities: Opportunity[] = [
    { id: 'OPP-001', name: 'Software ERP para XYZ Corp', client: 'XYZ Corp', stage: 'Negociación', amount: 150000, startDate: '2025-09-01', closeDate: '2025-12-15' },
    { id: 'OPP-002', name: 'Servicio de Consultoría Q2', client: 'Alpha Solutions', stage: 'Propuesta', amount: 45000, startDate: '2025-10-15', closeDate: '2025-11-30' },
    { id: 'OPP-003', name: 'Upgrade de Infraestructura', client: 'Tech Innovators', stage: 'Cerrada Ganada', amount: 80000, startDate: '2025-08-01', closeDate: '2025-10-20' },
    { id: 'OPP-004', name: 'Nuevo Contrato de Mantenimiento', client: 'Global Systems', stage: 'Prospección', amount: 12000, startDate: '2025-11-20', closeDate: '2026-01-05' },
    { id: 'OPP-005', name: 'Licencias Anuales', client: 'Beta Analytics', stage: 'Cerrada Perdida', amount: 25000, startDate: '2025-06-10', closeDate: '2025-09-01' },
    { id: 'OPP-006', name: 'Desarrollo App Móvil', client: 'App Startups', stage: 'Calificación', amount: 75000, startDate: '2025-10-05', closeDate: '2025-12-01' },
  ];

  // === SEÑALES COMPUTADAS (ESTADÍSTICAS) ===

  /** Calcula la suma de los montos de oportunidades activas y ganadas. */
  public totalPipelineAmount = computed(() => {
    return this.opportunities()
      .filter(o => o.stage !== 'Cerrada Perdida')
      .reduce((sum, opp) => sum + opp.amount, 0);
  });

  /** Cuenta el número de oportunidades que no están cerradas (ni ganadas ni perdidas). */
  public activeOpportunitiesCount = computed(() => {
    return this.opportunities().filter(
      o => o.stage !== 'Cerrada Ganada' && o.stage !== 'Cerrada Perdida'
    ).length;
  });

  /** Calcula la tasa de éxito (Ganadas / Totales Cerradas). */
  public winRate = computed(() => {
    const totalClosed = this.opportunities().filter(o => o.stage.startsWith('Cerrada')).length;
    const closedWon = this.opportunities().filter(o => o.stage === 'Cerrada Ganada').length;

    if (totalClosed === 0) return 'N/A';
    return ((closedWon / totalClosed) * 100).toFixed(1) + '%';
  });

  /** Genera el array de estadísticas para el panel superior. */
  public stats = computed(() => [
    { title: 'Total Pipeline', value: this.formatCurrency(this.totalPipelineAmount()) },
    { title: 'Oportunidades Activas', value: this.activeOpportunitiesCount() },
    { title: 'Oportunidades Ganadas', value: this.opportunities().filter(o => o.stage === 'Cerrada Ganada').length },
    { title: 'Tasa de Éxito', value: this.winRate() },
  ]);

  // === LÓGICA DE DATOS (SIMULACIÓN API) ===

  /**
   * Simula la carga de datos de oportunidades de un backend.
   */
  loadOpportunities(): void {
    this.isLoading.set(true);
    setTimeout(() => {
      this.opportunities.set(this.mockOpportunities);
      this.isLoading.set(false);
      console.log('Oportunidades cargadas con éxito.');
    }, 1500);
  }

  /**
   * Busca una oportunidad por ID.
   */
  getOpportunityById(id: string): Opportunity | undefined {
    return this.opportunities().find(o => o.id === id);
  }

  /**
   * Simula la petición POST para crear una nueva oportunidad.
   * @param opportunityData Datos de la nueva oportunidad.
   */
  async createOpportunity(opportunityData: Omit<Opportunity, 'id'>): Promise<void> {
    this.isSaving.set(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newOpportunity: Opportunity = {
      ...opportunityData,
      id: 'OPP-' + (this.opportunities().length + 1).toString().padStart(3, '0')
    };

    this.opportunities.update(currentOpps => [newOpportunity, ...currentOpps]);
    this.isSaving.set(false);
    console.log('Oportunidad guardada (POST simulado):', newOpportunity);
  }

  /**
   * Simula la petición PUT/PATCH para actualizar una oportunidad existente.
   * @param id ID de la oportunidad a actualizar.
   * @param opportunityData Datos actualizados.
   */
  async updateOpportunity(id: string, opportunityData: Omit<Opportunity, 'id'>): Promise<void> {
    this.isSaving.set(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    this.opportunities.update(currentOpps =>
      currentOpps.map(opp =>
        opp.id === id
          ? { ...opp, ...opportunityData }
          : opp
      )
    );
    this.isSaving.set(false);
    console.log(`Oportunidad ${id} actualizada (PUT simulado):`, opportunityData);
  }

  // === MÉTODOS DE UTILIDAD ===

  /**
   * Formatea un número como moneda (USD o similar).
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Formatea una fecha en formato corto.
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  /**
   * Retorna las clases Tailwind para el 'badge' de la etapa.
   */
  getStageBadgeClass(stage: Opportunity['stage']): string {
    let base = 'badge ';
    switch (stage) {
      case 'Cerrada Ganada':
        return base + 'bg-green-100 text-green-800';
      case 'Cerrada Perdida':
        return base + 'bg-red-100 text-red-800';
      case 'Prospección':
      case 'Calificación':
        return base + 'bg-yellow-100 text-yellow-800';
      case 'Propuesta':
      case 'Negociación':
        return base + 'bg-blue-100 text-blue-800';
      default:
        return base + 'bg-gray-100 text-gray-800';
    }
  }
}