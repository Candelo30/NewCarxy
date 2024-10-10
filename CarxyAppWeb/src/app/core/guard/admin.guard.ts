import { Injectable } from '@angular/core';
import { UserService } from '../services/user.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard {
  constructor(
    private router: Router,
    private cookieService: CookieService,
    private userData: UserService
  ) {}

  canActivate(): Observable<boolean> {
    const token = this.cookieService.get('token');

    // Si hay un token, verificar el estado del usuario
    return this.userData.DataUser().pipe(
      map((data) => {
        // Verificar si el usuario es un administrador
        if (data.is_staff) {
          return true; // Permitir acceso a rutas de administrador
        } else {
          this.router.navigate(['/']); // Redirigir a una ruta segura
          return false; // Denegar acceso
        }
      }),
      catchError((error) => {
        // En caso de error, redirigir a una ruta segura
        this.router.navigate(['/']); // O puedes redirigir a otra ruta
        return of(false); // Retornar un observable con `false`
      })
    );
  }
}
