import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// Tipos base para mapear la respuesta de Spring
export interface ClienteSpringDTO { 
  idCliente: number;
  nombre: string;
  email: string;
  telefono: string;
  // Spring devuelve el nombre del enum en mayúsculas (ACTIVO, INACTIVO, PENDIENTE)
  estado: string; 
  // Nota: Asumo que el backend no devuelve 'fechaRegistro', lo mapearemos
  // o lo simularemos temporalmente para mantener la interfaz de Angular.
}

// Interfaces de Angular
export interface Cliente { 
  id: number; 
  nombre: string; 
  email: string; 
  telefono: string; 
  fechaRegistro: string; // Se mantendrá para el front-end
  estado: 'Activo' | 'Inactivo' | 'Pendiente'; 
}
export interface NuevoCliente { 
  nombre: string; 
  email: string; 
  telefono: string; 
  estado: 'Activo' | 'Inactivo' | 'Pendiente'; // El backend espera estos valores
}


@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  
  // URL base del controlador de Spring
  private readonly API_URL = 'http://localhost:8080/clientes';
  
  // Inyección de HttpClient
  private http = inject(HttpClient);

  // --- Funciones de Mapeo para adaptar la respuesta de Spring al Front-end ---

  /** Mapea el DTO de Spring a la interfaz de Cliente de Angular */
  private mapToAngularCliente(dto: ClienteSpringDTO): Cliente {
    // Convertir el estado de MAYÚSCULAS (Spring ENUM) a Capitalizado (Angular)
    const estadoAngular = dto.estado.charAt(0).toUpperCase() + dto.estado.slice(1).toLowerCase() as Cliente['estado'];

    return {
      id: dto.idCliente, // Mapeo de idCliente a id
      nombre: dto.nombre,
      email: dto.email,
      telefono: dto.telefono,
      estado: estadoAngular,
      // Simulamos la fecha de registro si el backend no la proporciona
      fechaRegistro: new Date().toISOString().split('T')[0]
    };
  }

  /** Prepara el DTO para enviar a Spring */
  private mapToSpringDTO(data: NuevoCliente | Cliente): any {
      // Convertir el estado de Capitalizado (Angular) a MAYÚSCULAS (Spring ENUM)
    const estadoSpring = data.estado.toUpperCase();
    
    return {
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,
      estado: estadoSpring,
    };
  }

  // --- Métodos CRUD con conexión al API REST ---

  /** GET /clientes: Obtiene la lista de clientes del usuario logueado. */
  async getClientes(): Promise<Cliente[]> {
    try {
      const dtos = await firstValueFrom(this.http.get<ClienteSpringDTO[]>(this.API_URL));
      return dtos.map(this.mapToAngularCliente);
    } catch (error) {
      console.error('Error al obtener clientes desde Spring:', error);
      throw new Error('Fallo la conexión con el servicio de clientes.');
    }
  }

  /** POST /clientes: Crea un nuevo cliente. */
  async createCliente(data: NuevoCliente): Promise<Cliente> {
    const dtoToSend = this.mapToSpringDTO(data);
    try {
      const createdDto = await firstValueFrom(this.http.post<ClienteSpringDTO>(this.API_URL, dtoToSend));
      return this.mapToAngularCliente(createdDto);
    } catch (error) {
       console.error('Error al crear cliente en Spring:', error);
       throw new Error('Fallo al crear el cliente.');
    }
  }

  /** PUT /clientes/{id}: Actualiza un cliente existente. */
  async updateCliente(data: Cliente): Promise<Cliente> {
    const dtoToSend = this.mapToSpringDTO(data);
    try {
      const updatedDto = await firstValueFrom(this.http.put<ClienteSpringDTO>(`${this.API_URL}/${data.id}`, dtoToSend));
      return this.mapToAngularCliente(updatedDto);
    } catch (error) {
      console.error('Error al actualizar cliente en Spring:', error);
      throw new Error('Fallo al actualizar el cliente.');
    }
  }

  /** DELETE /clientes/{id}: Elimina un cliente. */
  async deleteCliente(id: number): Promise<void> {
    try {
      // El DELETE del back-end no devuelve contenido
      await firstValueFrom(this.http.delete<any>(`${this.API_URL}/${id}`));
    } catch (error) {
      console.error('Error al eliminar cliente en Spring:', error);
      throw new Error('Fallo al eliminar el cliente.');
    }
  }
}