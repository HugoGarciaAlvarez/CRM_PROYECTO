// contacto.service.ts
import { Injectable, signal } from '@angular/core';

// 1. Interfaz de Datos: Definida y exportada aquí ya que el servicio maneja la data
export interface Contacto {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  estado: 'Activo' | 'Potencial' | 'Inactivo';
}

@Injectable({
  providedIn: 'root'
})
export class ContactoService {
  // Estado principal de la lista de contactos (Signal)
  public contacts = signal<Contacto[]>([]);
  
  constructor() { }

  /**
   * Simula la carga inicial de contactos desde una API con latencia y posible error.
   */
  private simulateFetchContacts(): Promise<Contacto[]> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const shouldError = Math.random() < 0.05; 
        if (shouldError) {
          reject("No se pudo conectar con el servidor para obtener los datos.");
          return;
        }

        const mockData: Contacto[] = [
          { id: 1, nombre: 'Javier Pérez', email: 'javier.perez@tec.com', telefono: '55 1234 5678', empresa: 'Tecnología Avanzada S.L.', estado: 'Activo' },
          { id: 2, nombre: 'Ana García', email: 'ana.garcia@market.mx', telefono: '81 9876 5432', empresa: 'Marketing Digital MX', estado: 'Potencial' },
          { id: 3, nombre: 'Ricardo López', email: 'r.lopez@inmo.es', telefono: '91 5555 1111', empresa: 'Inmobiliaria Central', estado: 'Activo' },
          { id: 4, nombre: 'Sofía Martínez', email: 'sofia.m@global.us', telefono: '001 202 555 0177', empresa: 'Global Solutions Inc.', estado: 'Inactivo' },
          { id: 5, nombre: 'Elisa Torres', email: 'elisa.t@proyecta.com', telefono: '33 2222 3333', empresa: 'Proyecta Consultoría', estado: 'Activo' },
        ];
        resolve(mockData);
      }, 1500);
    });
  }

  /**
   * Carga los contactos en el signal 'contacts'.
   * @returns El mensaje de error (string) si falla, o null si tiene éxito.
   */
  public async loadContacts(): Promise<string | null> {
    try {
      const data = await this.simulateFetchContacts();
      this.contacts.set(data);
      return null;
    } catch (err: any) {
      return err.toString();
    }
  }

  /**
   * Guarda o actualiza un contacto en la lista.
   * @param contact El objeto Contacto a guardar.
   */
  public saveContact(contact: Contacto): void {
    if (contact.id > 0) {
      // Lógica de Actualización
      this.contacts.update(contacts => contacts.map(c =>
        c.id === contact.id ? contact : c
      ));
    } else {
      // Lógica de Creación: asigna un nuevo ID positivo
      const currentMaxId = this.contacts().length > 0 ? Math.max(...this.contacts().map(c => c.id)) : 0;
      const newId = currentMaxId + 1;
      const finalNewContact = { ...contact, id: newId };
      this.contacts.update(contacts => [finalNewContact, ...contacts]);
    }
  }
}