import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { UserService } from '../core/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private cookieService: CookieService,
    private userData: UserService
  ) {}

  canActivate(): Observable<boolean> {
    const token = this.cookieService.get('token');

    if (token) {
      // Si hay un token, verificar el estado del usuario
      return this.userData.DataUser().pipe(
        map((data) => {
          // Si los datos del usuario son válidos, permitir el acceso
          return true;
        }),
        catchError((error) => {
          // En caso de error, eliminar el token y redirigir al login
          this.cookieService.delete('token');
          this.router.navigate(['/login']);
          return of(false); // Retornar un observable con `false`
        })
      );
    } else {
      // Si no hay token, redirigir al login
      this.router.navigate(['/login']);
      return of(false); // Retornar un observable con `false`
    }
  }
}
