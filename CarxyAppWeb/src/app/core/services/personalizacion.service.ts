import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PersonalizacionService {
  private apiUrl = 'http://localhost:8000/api'; // URL de la API

  constructor(private http: HttpClient) {}

  // Personalizar una parte específica (POST)
  personalizarParte(parteId: number, color: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/personalizar-parte/${parteId}/`,
      {
        color,
      }
    );
  }

  // Obtener la lista de personalizaciones (GET)
  getPersonalizaciones(): Observable<any> {
    return this.http.get(`${this.apiUrl}/personalizaciones/`);
  }

  // Obtener la lista de personalizaciones (GET)
  getPersonalizacionesPorID(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/personalizaciones/${id}/`);
  }

  // Crear una nueva personalización (POST)
  crearPersonalizacion(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/personalizaciones/`, data);
  }

  // Modificar una personalización existente (PUT)
  modificarPersonalizacion(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/personalizaciones/${id}/`, data);
  }

  // Eliminar una personalización (DELETE)
  eliminarPersonalizacion(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/personalizaciones/${id}/`);
  }
}
