import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { OportunidadesService, Opportunity, STAGES_DISPLAY } from '../services/oportunidades.service';
import { ClientesService, Cliente } from '../services/clientes.service';

@Component({
  selector: 'app-oportunidades',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './oportunidades.component.html',
  styles: [
    `.badge { padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; }
     .bg-green-100 { background-color: #d1fae5; color: #065f46; }
     .bg-red-100 { background-color: #fee2e2; color: #991b1b; }
     .bg-yellow-100 { background-color: #fef3c7; color: #92400e; }
     .bg-blue-100 { background-color: #dbeafe; color: #1e40af; }
     .error-message { color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem; }`
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OportunidadesComponent implements OnInit {
  public oportunidadesService = inject(OportunidadesService);
  private fb = inject(FormBuilder);
  private clientesService = inject(ClientesService);

  public isFormOpen = signal(false);
  public selectedOpportunityId = signal<string | null>(null);
  public isEditing = computed(() => this.selectedOpportunityId() !== null);

  // Notificaciones y eliminación
  public confirmationMessage = signal<string | null>(null);
  public showDeleteConfirmation = signal(false);
  public opportunityToDelete = signal<string | null>(null);
  public isDeleting = signal(false);

  public opportunityForm!: FormGroup;
  public stages = STAGES_DISPLAY;
  public clientes: Cliente[] = [];

  ngOnInit() {
    this.oportunidadesService.loadOpportunities();
    this.initForm();
    this.loadClientes();
  }

  initForm(): void {
    const today = new Date().toISOString().substring(0, 10);
    this.opportunityForm = this.fb.group({
      id: [null],
      idCliente: [null, Validators.required],
      idUsuario: [1],
      name: ['', Validators.required],
      stage: [this.stages[0] as Opportunity['stage'], Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      startDate: [today, Validators.required],
      closeDate: [today, Validators.required],
    });
  }

  async loadClientes() {
    try {
      this.clientes = await this.clientesService.getClientes();
    } catch (err) {
      console.error('Error al cargar clientes', err);
    }
  }

  getControl(fieldName: string): AbstractControl | null {
    return this.opportunityForm.get(fieldName);
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.getControl(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  openCreateForm(): void {
    const today = new Date().toISOString().substring(0, 10);
    this.selectedOpportunityId.set(null);
    this.opportunityForm.reset({
      id: null,
      idCliente: null,
      idUsuario: 1,
      stage: this.stages[0],
      startDate: today,
      closeDate: today,
      amount: 0
    });
    this.isFormOpen.set(true);
  }

  async openEditForm(id: string) {
    const opp = this.oportunidadesService.getOpportunityById(id);
    if (!opp) return;

    this.selectedOpportunityId.set(id);

    if (this.clientes.length === 0) await this.loadClientes();

    this.opportunityForm.patchValue({
      id: opp.id,
      idCliente: opp.idCliente || null,
      idUsuario: opp.idUsuario,
      name: opp.name,
      stage: opp.stage,
      amount: opp.amount || 0,
      startDate: opp.startDate,
      closeDate: opp.closeDate,
    });

    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.selectedOpportunityId.set(null);
  }

  async saveOpportunity(): Promise<void> {
    if (this.opportunityForm.invalid) {
      this.opportunityForm.markAllAsTouched();
      return;
    }

    const data: Opportunity = this.opportunityForm.value;

    try {
      if (this.selectedOpportunityId()) {
        data.id = this.selectedOpportunityId();
        await this.oportunidadesService.updateOpportunity(data.id!, data);
        this.confirmationMessage.set(`Oportunidad "${data.name}" actualizada con éxito.`);
      } else {
        await this.oportunidadesService.createOpportunity(data);
        this.confirmationMessage.set(`Oportunidad "${data.name}" creada con éxito.`);
      }
      this.closeForm();
    } catch (err) {
      console.error("Error al guardar la oportunidad:", err);
    }
  }

  prepareDelete(): void {
    const id = this.selectedOpportunityId();
    if (!id) return;
    
    const opp = this.oportunidadesService.getOpportunityById(id);
    if (!opp) return;
    
    this.opportunityToDelete.set(id);
    this.showDeleteConfirmation.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirmation.set(false);
    this.opportunityToDelete.set(null);
  }

  async confirmDelete(): Promise<void> {
    const id = this.opportunityToDelete();
    if (!id) return;

    const opp = this.oportunidadesService.getOpportunityById(id);
    if (!opp) return;

    this.isDeleting.set(true);
    try {
      await this.oportunidadesService.deleteOpportunity(id);
      this.confirmationMessage.set(`Oportunidad "${opp.name}" eliminada con éxito.`);
      this.closeForm();
    } catch (err) {
      console.error("Error al eliminar la oportunidad:", err);
      this.confirmationMessage.set(`ERROR: No se pudo eliminar la oportunidad.`);
    } finally {
      this.isDeleting.set(false);
      this.cancelDelete();
    }
  }

  async onDeleteOpportunity() {
    this.prepareDelete();
  }

  getStageBadgeClass(stage: Opportunity['stage']) {
    return this.oportunidadesService.getStageBadgeClass(stage);
  }

  getStageLabel(stage: Opportunity['stage']) {
    const labels: { [key in Opportunity['stage']]: string } = {
      PROSPECCION: 'Prospección',
      CALIFICACION: 'Calificación',
      PROPUESTA: 'Propuesta',
      NEGOCIACION: 'Negociación',
      CERRADA_GANADA: 'Cerrada Ganada',
      CERRADA_PERDIDA: 'Cerrada Perdida'
    };
    return labels[stage];
  }

  formatCurrency(amount: number) {
    return amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
  }

  formatDate(date: string) {
    const d = new Date(date);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('es-ES');
  }

  getClienteNombre(idCliente: number | null | undefined): string {
    return this.clientes.find(c => c.id === idCliente)?.nombre || '';
  }

  get stats() {
    const opportunities = this.oportunidadesService.opportunities();
    const total = opportunities.length;
    const cerradasGanadas = opportunities.filter(o => o.stage === 'CERRADA_GANADA').length;
    const totalAmountEUR = opportunities.reduce((sum, o) => sum + o.amount, 0);
    const tasaExito = total > 0 ? (cerradasGanadas / total) * 100 : 0;

    return [
      { title: 'Oportunidades Totales', value: total },
      { title: 'Oportunidades Ganadas', value: cerradasGanadas },
      { title: 'Cantidad Total (€)', value: totalAmountEUR.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) },
      { title: 'Tasa de Éxito (%)', value: tasaExito.toFixed(2) + '%' },
    ];
  }
}
