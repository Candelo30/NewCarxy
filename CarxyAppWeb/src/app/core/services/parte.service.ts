import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ParteService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // Obtener las partes de un modelo por su ID
  getPartesPorModelo(modeloId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/partes/por-modelo/${modeloId}/`);
  }

  // Guardar partes personalizadas
  savePartes(partes: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/partes/`, partes);
  }
}
