import { Component, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { InicioService, ClienteReciente } from '../services/inicio.service'; 

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './inicio.component.html'
})
export class InicioComponent implements AfterViewInit {

  // Señales
  username = signal(''); 
  tareasFaltantes = signal(0);
  incidenciasTramite = signal(0);
  incidenciasActivas = signal(0);
  clientesRecientes = signal<ClienteReciente[]>([]); 
  cargando = signal(true);
  
  // Datos para gráficas
  ventasMensualesValores = signal<number[]>([]);
  ventasMensualesLabels = signal<string[]>([]);
  leadsPorEstado = signal<number[]>([]);

  // Referencias a canvas
  @ViewChild('ventasCanvas') ventasCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('leadsCanvas') leadsCanvas!: ElementRef<HTMLCanvasElement>;

  ventasChart!: Chart;
  leadsChart!: Chart;

  constructor(private inicioService: InicioService) {}

  ngAfterViewInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando.set(true);
    
    this.inicioService.obtenerDashboard().subscribe({
      next: (res: any) => {
        
        // --- CÁLCULOS SOLICITADOS EN ANGULAR ---

        // 1. Tareas Faltantes (Estado: PENDIENTE)
        const pendientes = res.tareas.filter((t: any) => t.estado === 'PENDIENTE').length;
        this.tareasFaltantes.set(pendientes);

        // 2. Incidencias en Trámite (Estado: EN_PROGRESO)
        // Nota: Asumo que el JSON que recibes del servicio ahora incluye 'EN_PROGRESO' 
        // para el cálculo de incidencias en trámite.
        const enTramite = res.incidencias.filter((i: any) => i.estado === 'EN_PROGRESO').length;
        this.incidenciasTramite.set(enTramite);

        // 3. Incidencias Activas (Estado: ABIERTA)
        const activas = res.incidencias.filter((i: any) => i.estado === 'ABIERTA').length;
        this.incidenciasActivas.set(activas);

        // 4. Leads por Estado (Prioridad de Tarea: ALTA, MEDIA, BAJA)
        const alta = res.tareas.filter((t: any) => t.prioridad === 'ALTA').length;
        const media = res.tareas.filter((t: any) => t.prioridad === 'MEDIA').length;
        const baja = res.tareas.filter((t: any) => t.prioridad === 'BAJA').length;
        this.leadsPorEstado.set([alta, media, baja]);


        // --- MAPEO DE CLIENTES (Para asegurar el Email) ---
        // Mapeamos los clientes recientes para usar el email como ultimoContacto
        const clientesMapeados: ClienteReciente[] = res.clientesRecientes.map((c: any) => ({
            nombre: c.nombre,
            estado: c.estado,
            ultimoContacto: c.email // Usamos el campo 'email' como 'ultimoContacto'
        }));
        this.clientesRecientes.set(clientesMapeados);


        // --- Mapeo de Ventas Mensuales (Gráfica) ---
        const mesesLargos = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
        const labels = Object.keys(res.ventasMensuales)
                         .map(key => mesesLargos[parseInt(key.substring(5)) - 1]);
        const valores = Object.values(res.ventasMensuales).map(v => parseFloat(v as string));

        this.ventasMensualesLabels.set(labels);
        this.ventasMensualesValores.set(valores);

        // --- Asignación de campo simple (Username) ---
        this.username.set(res.tareas[0]?.usuarioUsername || 'Usuario'); 

        this.cargando.set(false);

        // 3. Inicializar gráficas
        setTimeout(() => {
          this.inicializarGraficas();
        }, 0);
      },
      error: (err) => {
        console.error('Error al cargar dashboard:', err);
        this.cargando.set(false);
      }
    });
  }

  private inicializarGraficas(): void {
      if (this.ventasCanvas && this.leadsCanvas) {
        
        if (this.ventasChart) this.ventasChart.destroy();
        if (this.leadsChart) this.leadsChart.destroy();
        
        // Gráfica de Ventas
        this.ventasChart = new Chart(this.ventasCanvas.nativeElement, {
          type: 'line',
          data: {
            labels: this.ventasMensualesLabels(),
            datasets: [{
              label: 'Ventas Mensuales',
              data: this.ventasMensualesValores(),
              borderColor: '#3b82f6',
              backgroundColor: '#bfdbfe',
              fill: true,
              tension: 0.3
            }]
          },
          options: {
            responsive: false,
            maintainAspectRatio: false
          }
        });

        // Gráfica de Leads/Prioridad (CORRECCIÓN EN DATASETS)
        this.leadsChart = new Chart(this.leadsCanvas.nativeElement, { 
          type: 'doughnut',
          data: { // Objeto de datos
            labels: ['Prioridad ALTA','Prioridad MEDIA','Prioridad BAJA'], 
            datasets: [{ // <--- ¡AQUÍ ESTÁ LA CORRECCIÓN!
              data: this.leadsPorEstado(), // [ALTA, MEDIA, BAJA] (Era la línea 134 que causaba el error)
              backgroundColor: ['#ef4444', '#f97316', '#fbbf24'] 
            }]
          },
          options: {
            responsive: false,
            maintainAspectRatio: false
          }
        });
      }
  }
}