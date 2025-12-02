import { Component, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { InicioService } from '../services/inicio.service'; // Importando el servicio correcto

// ---
// 1. INTERFACES (Definidas en el componente para un modelo de datos local)
interface ClienteReciente {
  nombre: string;
  estado: string;
  ultimoContacto: string;
}

interface DashboardData {
  nombre: string;
  tareasFaltantes: number;
  incidenciasTramite: number;
  incidenciasActivas: number;
  clientesRecientes: ClienteReciente[];
  ventasMensuales: number[];
  leadsPorEstado: number[];
}
// ---

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './inicio.component.html'
})
export class InicioComponent implements AfterViewInit {

  // Señales
  nombre = signal('');
  tareasFaltantes = signal(0);
  incidenciasTramite = signal(0);
  incidenciasActivas = signal(0);
  // Tipado de clientesRecientes usando la interfaz local
  clientesRecientes = signal<DashboardData['clientesRecientes']>([]); 
  cargando = signal(true);
  
  // DATOS ADICIONALES para las gráficas (usamos signals para Chart.js)
  ventasMensuales = signal<number[]>([]);
  leadsPorEstado = signal<number[]>([]);

  // Referencias a canvas
  @ViewChild('ventasCanvas') ventasCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('leadsCanvas') leadsCanvas!: ElementRef<HTMLCanvasElement>;

  ventasChart!: Chart;
  leadsChart!: Chart;

  // CORRECCIÓN: Inyectamos el servicio correcto (InicioService)
  constructor(private inicioService: InicioService) {}

  ngAfterViewInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando.set(true);
    
    // Llamada al servicio y suscripción
    this.inicioService.obtenerDashboard().subscribe({ // Usamos inicioService
      // Hacemos un cast a DashboardData para asegurar el tipado
      next: (res: DashboardData) => { 
        // 1. Actualizar Signals con datos del dashboard
        this.nombre.set(res.nombre);
        this.tareasFaltantes.set(res.tareasFaltantes);
        this.incidenciasTramite.set(res.incidenciasTramite);
        this.incidenciasActivas.set(res.incidenciasActivas);
        this.clientesRecientes.set(res.clientesRecientes);
        
        // Almacenar datos de gráficas en signals
        this.ventasMensuales.set(res.ventasMensuales);
        this.leadsPorEstado.set(res.leadsPorEstado);
        
        this.cargando.set(false);

        // 2. Inicializar gráficas después de la actualización del DOM
        setTimeout(() => {
          this.inicializarGraficas(res);
        }, 0);
      },
      error: (err) => {
        console.error('Error al cargar dashboard:', err);
        this.cargando.set(false);
      }
    });
  }

  // Se extrae la lógica de inicialización de gráficas a un método
  private inicializarGraficas(res: DashboardData): void {
      // Verificación de ViewChilds
      if (this.ventasCanvas && this.leadsCanvas) {
        
        // Destruir gráficas existentes
        if (this.ventasChart) this.ventasChart.destroy();
        if (this.leadsChart) this.leadsChart.destroy();

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
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { ticks: { maxRotation: 0, autoSkip: true } } }
          }
        });

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
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } }
          }
        });
      }
  }
}