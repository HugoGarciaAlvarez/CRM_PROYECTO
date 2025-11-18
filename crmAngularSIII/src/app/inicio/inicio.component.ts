import { Component, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { CrmService, DashboardData } from '../pruebasApi/crm.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule], // necesario para *ngIf, *ngFor
  templateUrl: './inicio.component.html'
})
export class InicioComponent implements AfterViewInit {

  // Señales
  nombre = signal('');
  tareasFaltantes = signal(0);
  incidenciasTramite = signal(0);
  incidenciasActivas = signal(0);
  clientesRecientes = signal<{ nombre:string; estado:string; ultimoContacto:string }[]>([]);
  cargando = signal(true);

  // Referencias a canvas
  @ViewChild('ventasCanvas') ventasCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('leadsCanvas') leadsCanvas!: ElementRef<HTMLCanvasElement>;

  ventasChart!: Chart;
  leadsChart!: Chart;

  constructor(private crmService: CrmService) {}

  ngAfterViewInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.crmService.obtenerDashboard().subscribe(res => {
      this.nombre.set(res.nombre);
      this.tareasFaltantes.set(res.tareasFaltantes);
      this.incidenciasTramite.set(res.incidenciasTramite);
      this.incidenciasActivas.set(res.incidenciasActivas);
      this.clientesRecientes.set(res.clientesRecientes);
      this.cargando.set(false);

      setTimeout(() => {
        if (this.ventasCanvas && this.leadsCanvas) {

          // Gráfica de Ventas
          this.ventasChart = new Chart(this.ventasCanvas.nativeElement, {
            type: 'line',
            data: {
              labels: ['Ene','Feb','Mar','Abr','May','Jun'],
              datasets: [{
                label: 'Ventas Mensuales',
                data: res.ventasMensuales,
                borderColor: '#3b82f6',
                backgroundColor: '#bfdbfe',
                fill: true,
                tension: 0.3
              }]
            },
            options: {
              responsive: false,        // importante: no escalar automáticamente
              maintainAspectRatio: false
            }
          });

          // Gráfica de Leads
          this.leadsChart = new Chart(this.leadsCanvas.nativeElement, {
            type: 'doughnut',
            data: {
              labels: ['Nuevo','En seguimiento','Convertido'],
              datasets: [{
                data: res.leadsPorEstado,
                backgroundColor: ['#fbbf24','#f97316','#ef4444']
              }]
            },
            options: {
              responsive: false,       // no escalar automáticamente
              maintainAspectRatio: false
            }
          });

        }
      });
    });
  }
}
