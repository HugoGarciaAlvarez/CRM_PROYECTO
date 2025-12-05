import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { OportunidadesService, STAGES_DISPLAY, Opportunity } from '../services/oportunidades.service';

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

  public isFormOpen = signal(false);
  public selectedOpportunityId = signal<string | null>(null);
  public isEditing = computed(() => this.selectedOpportunityId() !== null);

  public opportunityForm!: FormGroup;
  public stages = STAGES_DISPLAY;

  ngOnInit() {
    this.oportunidadesService.loadOpportunities();
    this.initForm();
  }

  initForm(): void {
    const today = new Date().toISOString().substring(0, 10);
    this.opportunityForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      client: ['', Validators.required],
      stage: [this.stages[0], Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      startDate: [today, Validators.required],
      closeDate: [today, Validators.required],

      idCliente: [null],
      idUsuario: [null]
    });
  }

  // Método auxiliar para obtener el control del formulario de forma segura
  getControl(fieldName: string): AbstractControl | null {
    return this.opportunityForm.get(fieldName);
  }

  // MÉTODO COMPROBADO: Valida si un campo debe mostrar error
  isFieldInvalid(fieldName: string): boolean {
    const control = this.getControl(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  openCreateForm(): void {
    const today = new Date().toISOString().substring(0, 10);
    this.selectedOpportunityId.set(null);
    this.opportunityForm.reset({
      id: null,
      stage: this.stages[0],
      startDate: today,
      closeDate: today,
      idCliente: null,
      idUsuario: null,
      amount: 0
    });
    this.opportunityForm.markAsPristine();
    this.opportunityForm.markAsUntouched();
    this.isFormOpen.set(true);
  }

  openEditForm(id: string): void {
    const opp = this.oportunidadesService.getOpportunityById(id);
    if (opp) {
      this.selectedOpportunityId.set(id);

      // Creamos un objeto para el patchValue, asignando un valor por defecto si es null/undefined
      const formValues = {
        id: opp.id,
        name: opp.name,
        // FIX: Si client es null, usamos cadena vacía.
        client: opp.client || '',
        stage: opp.stage,
        // FIX: Si amount es null, usamos 0.
        amount: opp.amount || 0,
        startDate: opp.startDate,
        closeDate: opp.closeDate,

        // IDs simulados para el backend (asumiendo que 1 existe):
        idCliente: 1,
        idUsuario: 1
      };

      this.opportunityForm.patchValue(formValues);

      this.opportunityForm.markAsPristine();
      this.opportunityForm.markAsUntouched();

      this.isFormOpen.set(true);
    } else {
      console.error(`Oportunidad con ID ${id} no encontrada.`);
    }
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.selectedOpportunityId.set(null);
    this.opportunityForm.markAsPristine();
    this.opportunityForm.markAsUntouched();
  }

  async saveOpportunity(): Promise<void> {
    if (this.opportunityForm.invalid) {
      this.opportunityForm.markAllAsTouched();
      return;
    }

    let data = this.opportunityForm.value as Opportunity;

    // Asignación de IDs simulados si son nulos (para creación o si no se cargaron)
    if (!data.idCliente) data.idCliente = 1;
    if (!data.idUsuario) data.idUsuario = 1;

    const currentId = this.selectedOpportunityId();
    try {
      if (currentId) {
        data.id = currentId;
        await this.oportunidadesService.updateOpportunity(currentId, data);
      } else {
        await this.oportunidadesService.createOpportunity(data);
      }

      this.closeForm();
    } catch (err) {
      console.error("Error al guardar la oportunidad (403 si falla la seguridad):", err);
    }
  }

  async onDeleteOpportunity() {
    const id = this.selectedOpportunityId();
    if (!id) return;

    if (!confirm('¿Estás seguro de eliminar esta oportunidad?')) return;

    try {
      await this.oportunidadesService.deleteOpportunity(id);
      this.closeForm();
    } catch (err) { console.error("Error al eliminar la oportunidad:", err); }
  }

  getStageBadgeClass(stage: string) { return this.oportunidadesService.getStageBadgeClass(stage as any); }
  formatCurrency(amount: number) { return this.oportunidadesService.formatCurrency(amount); }
  formatDate(date: string) { return this.oportunidadesService.formatDate(date); }
}