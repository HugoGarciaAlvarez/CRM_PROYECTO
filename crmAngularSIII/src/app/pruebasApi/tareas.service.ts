import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface TareasResponse {
  nombre: string;
  tareasFaltantes: number[];
}

@Injectable({
  providedIn: 'root'
})
export class TareasService {

  constructor() {}

  // Simula un GET con retraso de 2 segundos
  obtenerTareas(): Observable<TareasResponse> {
    const respuesta: TareasResponse = {
      nombre: 'Francisco  Franco',
      tareasFaltantes: [10, 2, 7]
    };
    return of(respuesta).pipe(delay(2000));
  }
}