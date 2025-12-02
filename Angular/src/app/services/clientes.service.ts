import { Injectable } from '@angular/core';

// Tipos locales mínimos para el servicio
interface Cliente { id: number; nombre: string; email: string; telefono: string; fechaRegistro: string; estado: 'Activo' | 'Inactivo' | 'Pendiente'; }
interface NuevoCliente { nombre: string; email: string; telefono: string; estado: 'Activo' | 'Inactivo' | 'Pendiente'; }

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private mockClientes: Cliente[] = [
    { id: 1, nombre: 'Empresa Innovadora S.L.', email: 'contacto@innovadora.com', telefono: '912345678', fechaRegistro: '2023-11-15', estado: 'Activo' },
    { id: 2, nombre: 'Distribuciones Rápidas C.A.', email: 'ventas@rapidas.es', telefono: '930012345', fechaRegistro: '2023-12-01', estado: 'Activo' },
    { id: 3, nombre: 'Tecnologías del Mañana', email: 'soporte@techmanana.net', telefono: '600112233', fechaRegistro: '2024-01-20', estado: 'Pendiente' },
    { id: 4, nombre: 'Consultoría Global XYZ', email: 'info@globalxyz.com', telefono: '945678901', fechaRegistro: '2024-03-05', estado: 'Inactivo' },
    { id: 5, nombre: 'Marketing Digital Pro', email: 'hello@mktpro.co', telefono: '654321098', fechaRegistro: '2024-05-10', estado: 'Activo' },
    { id: 6, nombre: 'Fábrica de Componentes', email: 'pedido@fabrica.com', telefono: '950001122', fechaRegistro: '2024-06-28', estado: 'Activo' },
    { id: 7, nombre: 'Constructora Alfa', email: 'obra@alfa.com', telefono: '611223344', fechaRegistro: '2024-07-01', estado: 'Activo' },
    { id: 8, nombre: 'Servicios Logísticos Beta', email: 'envios@beta.net', telefono: '900110011', fechaRegistro: '2024-07-10', estado: 'Pendiente' },
  ];

  getClientes(): Promise<Cliente[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.mockClientes]);
      }, 1000);
    });
  }

  createCliente(data: NuevoCliente): Promise<Cliente> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCliente: Cliente = {
          ...data,
          id: this.mockClientes.length + 1, 
          fechaRegistro: new Date().toISOString().split('T')[0]
        };
        this.mockClientes.push(newCliente);
        resolve(newCliente);
      }, 500);
    });
  }
  
  updateCliente(data: Cliente): Promise<Cliente> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.mockClientes.findIndex(c => c.id === data.id);
        if (index !== -1) {
          Object.assign(this.mockClientes[index], data); 
          resolve(data);
        } else {
          reject(new Error("Cliente no encontrado para actualizar."));
        }
      }, 500);
    });
  }
}