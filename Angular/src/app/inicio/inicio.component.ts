// src/app/components/inicio/inicio.component.ts
import { Component, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { InicioService, ClienteReciente, DashboardData } from '../services/inicio.service'; 
import { AuthService } from '../services/auth.service'; // Necesario para obtener el username

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './inicio.component.html'
})
export class InicioComponent implements AfterViewInit {

  // --- Señales para la Interfaz de Usuario (KPIs) ---
  username = signal('Usuario'); // Valor por defecto si no se encuentra en el token
  tareasFaltantes = signal(0);
  incidenciasTramite = signal(0); 
  incidenciasActivas = signal(0); 
  clientesRecientes = signal<ClienteReciente[]>([]); 
  cargando = signal(true);
  
  // --- Señales para Gráficas ---
  ventasMensualesValores = signal<number[]>([]);
  ventasMensualesLabels = signal<string[]>([]);
  leadsPorEstado = signal<number[]>([]);

  // --- Referencias a Canvas del HTML ---
  @ViewChild('ventasCanvas') ventasCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('leadsCanvas') leadsCanvas!: ElementRef<HTMLCanvasElement>;

  ventasChart!: Chart;
  leadsChart!: Chart;

  // 🚨 Inyección de Servicios y Asignación Inicial de Username
  constructor(
    private inicioService: InicioService,
    private authService: AuthService // Inyectamos AuthService para leer el token
  ) {
    // Intentamos obtener el username del token JWT (campo 'sub').
    // Esto resuelve por qué no aparece "Hugo", ya que el dashboard DTO no lo envía.
    const user = this.authService.getUsernameFromToken();
    if (user) {
      // Capitalizar la primera letra para una bienvenida más formal (ej: 'hugo' -> 'Hugo')
      const capitalizedUser = user.charAt(0).toUpperCase() + user.slice(1);
      this.username.set(capitalizedUser); 
    }
  }

  ngAfterViewInit(): void {
    // Iniciamos la carga de datos del dashboard una vez que la vista ha sido inicializada
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando.set(true);
    
    this.inicioService.obtenerDashboard().subscribe({
      next: (res: DashboardData) => {
        
        // --- 🚨 PROTECCIÓN DE DATOS (Null Check) 🚨 ---
        // Usamos el operador '|| []' para garantizar que 'tareas' y 'clientesRecientes' 
        // siempre sean arrays, incluso si la respuesta del backend las envía como null o undefined.
        // Esto previene el error 'TypeError: Cannot read properties of undefined (reading 'filter')'.
        const tareas = res.tareas || []; 
        const clientesRecientes = res.clientesRecientes || [];
        
        // ---------------------------------------------

        // --- CÁLCULOS DE KPIS BASADOS EN TAREAS ---
        
        // 1. Tareas Faltantes (Estado: PENDIENTE)
        const pendientes = tareas.filter(t => t.estado === 'PENDIENTE').length;
        this.tareasFaltantes.set(pendientes);

        // 2. Incidencias en Trámite (Simulado con Tareas 'EN PROGRESO', ya que no hay lista de incidencias separada)
        const enTramite = tareas.filter(t => t.estado === 'EN PROGRESO').length;
        this.incidenciasTramite.set(enTramite);

        // 3. Incidencias Activas (Simulado con Tareas 'PENDIENTE')
        this.incidenciasActivas.set(pendientes); 

        // 4. Leads por Estado (Prioridad de Tarea: ALTA, MEDIA, BAJA)
        const alta = tareas.filter(t => t.prioridad === 'ALTA').length;
        const media = tareas.filter(t => t.prioridad === 'MEDIA').length;
        const baja = tareas.filter(t => t.prioridad === 'BAJA').length;
        this.leadsPorEstado.set([alta, media, baja]);


        // --- MAPEO DE CLIENTES ---
        // Mapeamos para garantizar que 'ultimoContacto' sea el 'email' del cliente.
        const clientesMapeados: ClienteReciente[] = clientesRecientes.map((c: any) => ({
            nombre: c.nombre,
            estado: c.estado,
            ultimoContacto: c.email 
        }));
        this.clientesRecientes.set(clientesMapeados);


        // --- Mapeo de Ventas Mensuales (Gráfica de Líneas) ---
        const mesesLargos = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
        const labels = Object.keys(res.ventasMensuales)
                          .map(key => mesesLargos[parseInt(key.substring(5)) - 1]);
        const valores = Object.values(res.ventasMensuales).map(v => parseFloat(v as any));

        this.ventasMensualesLabels.set(labels);
        this.ventasMensualesValores.set(valores);

        this.cargando.set(false);

        // Inicializar gráficas después de cargar y asignar todos los datos
        // Usamos setTimeout para asegurar que las referencias del ViewChild estén disponibles.
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

  // --- Lógica de Inicialización de Gráficas con Chart.js ---
  private inicializarGraficas(): void {
      // Destruir instancias anteriores si existen
      if (this.ventasChart) this.ventasChart.destroy();
      if (this.leadsChart) this.leadsChart.destroy();
        
      if (this.ventasCanvas && this.leadsCanvas) {

        // Gráfica de Ventas Mensuales (Líneas)
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

        // Gráfica de Leads/Prioridad (Dona)
        this.leadsChart = new Chart(this.leadsCanvas.nativeElement, { 
          type: 'doughnut',
          data: { 
            labels: ['Prioridad ALTA','Prioridad MEDIA','Prioridad BAJA'], 
            datasets: [{ 
              // Los datos se toman de la señal leadsPorEstado ([ALTA, MEDIA, BAJA])
              data: this.leadsPorEstado(), 
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