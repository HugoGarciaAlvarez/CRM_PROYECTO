import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/auth'; 

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, {
      username,
      password
    });
  }
  logout() {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  getUsernameFromToken(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      // 1. El token JWT tiene 3 partes separadas por puntos (header.payload.signature)
      const payloadBase64 = token.split('.')[1];
      
      // 2. Decodificar Base64 (en Angular, usamos btoa/atob o una librería)
      // Nota: 'atob' es una función global del navegador.
      const payloadDecoded = atob(payloadBase64);
      
      // 3. Parsear el JSON
      const payload = JSON.parse(payloadDecoded);
      
      // 4. Retornar el 'subject' (sub), que es el username
      return payload.sub || null;

    } catch (e) {
      console.error("Error decodificando el token:", e);
      return null;
    }
  }
}