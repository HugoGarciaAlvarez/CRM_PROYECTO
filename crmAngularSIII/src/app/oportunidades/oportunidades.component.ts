import { ChangeDetectionStrategy, Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { OportunidadesService, STAGES, Opportunity } from '../services/oportunidades.service'; // Importamos el servicio y tipos

@Component({
  selector: 'app-oportunidades', // Selector para uso en router
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './oportunidades.component.html',
  styles: [
    // Estilos personalizados para los badges de etapa
    `
      .badge {
        padding: 0.25rem 0.6rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
      }
      .bg-green-100 { background-color: #d1fae5; color: #065f46; }
      .bg-red-100 { background-color: #fee2e2; color: #991b1b; }
      .bg-yellow-100 { background-color: #fef3c7; color: #92400e; }
      .bg-blue-100 { background-color: #dbeafe; color: #1e40af; }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OportunidadesComponent implements OnInit {
  // Inyección de dependencias
  public oportunidadesService = inject(OportunidadesService);
  private fb = inject(FormBuilder);

  // === ESTADO LOCAL DE UI ===
  public isFormOpen = signal(false);
  public selectedOpportunityId = signal<string | null>(null);
  public isEditing = computed(() => this.selectedOpportunityId() !== null);

  public opportunityForm!: FormGroup;
  public stages = STAGES;

  ngOnInit() {
    this.oportunidadesService.loadOpportunities();
    this.initForm();
  }

  initForm(): void {
    const today = new Date().toISOString().substring(0, 10);

    this.opportunityForm = this.fb.group({
      name: ['', Validators.required],
      client: ['', Validators.required],
      stage: [STAGES[0], Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      startDate: [today, Validators.required], // Campo NUEVO
      closeDate: [today, Validators.required],
    });
  }

  openCreateForm(): void {
    const today = new Date().toISOString().substring(0, 10);

    this.selectedOpportunityId.set(null);
    this.opportunityForm.reset({
      stage: STAGES[0],
      startDate: today, // Valor por defecto para NUEVO campo
      closeDate: today
    });
    this.isFormOpen.set(true);
  }

  openEditForm(id: string): void {
    const opp = this.oportunidadesService.getOpportunityById(id);

    if (opp) {
      this.selectedOpportunityId.set(id);
      this.opportunityForm.setValue({
        name: opp.name,
        client: opp.client,
        stage: opp.stage,
        amount: opp.amount,
        startDate: opp.startDate, // Carga el valor del NUEVO campo
        closeDate: opp.closeDate,
      });
      this.isFormOpen.set(true);
    } else {
      console.error(`Oportunidad con ID ${id} no encontrada.`);
    }
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.selectedOpportunityId.set(null);
  }

  async saveOpportunity(): Promise<void> {
    if (this.opportunityForm.invalid) {
      this.opportunityForm.markAllAsTouched();
      console.error('El formulario es inválido.');
      return;
    }

    const data: Opportunity = this.opportunityForm.value as Opportunity;
    const currentId = this.selectedOpportunityId();

    try {
      if (currentId) {
        await this.oportunidadesService.updateOpportunity(currentId, data);
      } else {
        await this.oportunidadesService.createOpportunity(data);
      }
      this.closeForm();
    } catch (error) {
      console.error('Error al guardar/actualizar la oportunidad:', error);
    }
  }

  // === MÉTODOS PASAMANOS (Proxies) al Servicio para el Template ===

  getStageBadgeClass(stage: string): string {
    return this.oportunidadesService.getStageBadgeClass(stage as any);
  }

  formatCurrency(amount: number): string {
    return this.oportunidadesService.formatCurrency(amount);
  }

  formatDate(dateString: string): string {
    return this.oportunidadesService.formatDate(dateString);
  }
}