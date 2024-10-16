import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { forkJoin, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private http: HttpClient,
    private cookies: CookieService,
    private router: Router
  ) {}

  DataUser(): Observable<any> {
    return this.http.get('http://127.0.0.1:8000/perfil/');
  }

  DataAllUsers(): Observable<any> {
    return this.http.get('http://127.0.0.1:8000/api/usuarios/');
  }

  getUserById(id: number): Observable<any> {
    return this.http.get(`http://127.0.0.1:8000/api/usuarios/${id}/`);
  }

  deleteUsers(id: number): Observable<any> {
    return this.http.delete(`http://127.0.0.1:8000/api/usuarios/${id}/`);
  }

  // Método para actualizar un usuario
  updateUser(id: number, userData: any): Observable<any> {
    return this.http.patch(
      `http://127.0.0.1:8000/api/usuarios/${id}/`,
      userData
    );
  }

  // Método para esperar que todos los datos sean cargados
  loadAllResources(): Observable<any> {
    // Si tienes otras peticiones, agrégalas a `forkJoin`
    return forkJoin({
      userData: this.DataUser(),
      userAllData: this.DataAllUsers(),
      // Si tienes más peticiones, puedes agregarlas aquí:
      // otherData: this.http.get('otra-ruta-de-datos'),
    });
  }

  // Método para actualizar el perfil del usuario
  updateUserProfile(formData: FormData): Observable<any> {
    return this.http.put(`http://127.0.0.1:8000/perfil/`, formData);
  }

  updatePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post('http://127.0.0.1:8000/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  }

  // Método para eliminar la cuenta del usuario
  deleteUserAccount(): Observable<any> {
    return this.http.delete(`http://127.0.0.1:8000/perfil/`);
  }
}
