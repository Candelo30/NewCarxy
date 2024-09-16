import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private cookies: CookieService,
    private router: Router
  ) {}
  Registrar(usuario: any): Observable<any> {
    return this.http.post('http://127.0.0.1:8000/registro/', usuario);
  }

  IniciarSesion(usuario: any): Observable<any> {
    return this.http.post('http://127.0.0.1:8000/iniciar-sesion/', usuario);
  }

  AsignarToken(token: string) {
    this.cookies.set('token', token);
  }

  ObtenerToken() {
    return this.cookies.get('token');
  }

  BorrarToken() {
    return this.cookies.delete('token');
  }

  // Método para cerrar sesión (logout)
  logout() {
    // Elimina el token y los datos del usuario de las cookies
    this.BorrarToken();
    this.cookies.delete('loggedInUser');

    // Redirige al usuario a la página de login
    this.router.navigate(['/login']);
  }
}
