import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

// Importamos la interfaz Cliente del servicio de Clientes para mantener la coherencia
import { Cliente } from './clientes.service'; 

// Direcciones base de tu API Spring Boot
const BASE_CONTACTOS_URL = 'http://localhost:8080/contactos';

// 1. Interfaz de Datos
export interface Contacto {
  id: number; // Mapea a idContacto en Spring
  nombre: string;
  email: string;
  telefono: string;
  empresa: string; // Mapea a cargo en Spring (Nombre del Cliente/Empresa)
  estado: 'Activo' | 'Potencial' | 'Inactivo';
  idCliente: number; // Campo crucial y obligatorio para la relación 1:N
  idUsuario: number; // Necesario para el DTO
}

// Interfaz para el DTO que se envía al backend (para mapeo interno)
interface ContactoDTO {
  idContacto: number;
  idCliente: number;
  idUsuario: number;
  nombre: string;
  email: string;
  telefono: string;
  cargo: string; // Mapea a 'empresa' en Angular
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactoService {
  // Estado principal de la lista de contactos
  public contacts = signal<Contacto[]>([]);
  
  // No necesitamos el signal de clientes aquí, el componente lo manejará directamente con ClientesService

  // Inyección del HttpClient
  private http = inject(HttpClient);

  private readonly DEFAULT_USER_ID = 1;

  constructor() { }

  // **********************************
  // LÓGICA DE MAPEO DTO -> CONTACTO (UI)
  // **********************************

  private mapDtoToContact(dto: ContactoDTO): Contacto {
    return {
      id: dto.idContacto,
      nombre: dto.nombre,
      email: dto.email,
      telefono: dto.telefono,
      // Nota: Aquí 'cargo' se mapea a 'empresa'. 
      // El backend de Contacto (Controller que proporcionaste) asume que 'cargo' es la empresa.
      empresa: dto.cargo, 
      estado: dto.estado as Contacto['estado'],
      idCliente: dto.idCliente,
      idUsuario: dto.idUsuario,
    };
  }

  // LÓGICA DE MAPEO CONTACTO (UI) -> DTO
  private mapContactToDto(contact: Contacto): ContactoDTO {
    // idCliente es ahora obligatorio
    const clienteId = contact.idCliente; 
    
    return {
      idContacto: contact.id > 0 ? contact.id : 0, // 0 para el backend si es nuevo
      idCliente: clienteId,
      idUsuario: contact.idUsuario || this.DEFAULT_USER_ID,
      nombre: contact.nombre,
      email: contact.email,
      telefono: contact.telefono,
      cargo: contact.empresa, // Mapeo: empresa (que es el nombre del cliente) -> cargo
      estado: contact.estado,
    };
  }

  // **********************************
  // OPERACIONES CRUD (HTTP CLIENT)
  // **********************************

  /**
   * Carga todos los contactos de la API usando HttpClient.
   */
  public async loadContacts(): Promise<string | null> {
    try {
      const dtos = await lastValueFrom(this.http.get<ContactoDTO[]>(BASE_CONTACTOS_URL));
      const contacts = dtos.map(this.mapDtoToContact);
      this.contacts.set(contacts);
      return null;
    } catch (err: any) {
      const message = err.status ? `Error ${err.status} de servidor` : err.message;
      console.error('Error en loadContacts:', err);
      return `Fallo al obtener contactos. ${message}`;
    }
  }

  /**
   * Guarda o actualiza un contacto en la API usando HttpClient.
   */
  public async saveContact(contact: Contacto): Promise<string | null> {
    const isUpdate = contact.id > 0;
    const dto = this.mapContactToDto(contact);
    const url = isUpdate ? `${BASE_CONTACTOS_URL}/${contact.id}` : BASE_CONTACTOS_URL;
    
    // Define el Observable de la petición
    const httpObservable = isUpdate 
      ? this.http.put<ContactoDTO>(url, dto) 
      : this.http.post<ContactoDTO>(url, dto);

    try {
      const updatedDto = await lastValueFrom(httpObservable);
      const updatedContact = this.mapDtoToContact(updatedDto);

      if (isUpdate) {
        // Lógica de Actualización en el signal
        this.contacts.update(contacts => contacts.map(c =>
          c.id === updatedContact.id ? updatedContact : c
        ));
      } else {
        // Lógica de Creación en el signal (añadir al principio)
        this.contacts.update(contacts => [updatedContact, ...contacts]);
      }
      return null;
    } catch (err: any) {
      const message = err.status ? `Error ${err.status} de servidor` : err.message;
      console.error('Error en saveContact:', err);
      return `Fallo al ${isUpdate ? 'actualizar' : 'crear'} contacto: ${message}`;
    }
  }

  /**
   * Elimina un contacto de la API usando HttpClient.
   */
  public async deleteContact(id: number): Promise<string | null> {
    const url = `${BASE_CONTACTOS_URL}/${id}`;

    try {
      // DELETE retorna un Observable vacío, lo convertimos a Promesa.
      await lastValueFrom(this.http.delete(url)); 
      
      // Lógica de Eliminación en el signal
      this.contacts.update(contacts => contacts.filter(c => c.id !== id));
      return null;

    } catch (err: any) {
      const message = err.status ? `Error ${err.status} de servidor` : err.message;
      console.error('Error en deleteContact:', err);
      return `Fallo al eliminar contacto: ${message}`;
    }
  }
}