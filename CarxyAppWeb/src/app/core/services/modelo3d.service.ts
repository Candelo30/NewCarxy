import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Modelo3dService {
  private apiUrl = 'http://localhost:8000/api/modelos3d/'; // URL de tu API de Django

  constructor(private http: HttpClient) {}

  // Obtener la lista de modelos 3D (GET)
  getModelos(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Crear un nuevo modelo 3D (POST)
  createModelo(modelo: FormData): Observable<any> {
    return this.http.post(this.apiUrl, modelo);
  }

  // Actualizar un modelo 3D existente (PUT)
  updateModelo(id: number, modelo: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}${id}/`, modelo);
  }

  // Eliminar un modelo 3D (DELETE)
  deleteModelo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
