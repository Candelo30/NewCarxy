import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ParteService {
  private apiUrl = 'http://localhost:8000/'; // Cambia esto a tu URL de API

  constructor(private http: HttpClient) {}

  // Obtener todas las partes del usuario autenticado
  getPartes(): Observable<any> {
    return this.http.get(`${this.apiUrl}partes/`);
  }

  // Crear una nueva parte
  crearParte(parteData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}partes/`, parteData);
  }

  // Actualizar una parte existente
  actualizarParte(id: number, parteData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}partes/${id}/`, parteData);
  }

  // Eliminar una parte
  eliminarParte(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}partes/${id}/`);
  }
}
