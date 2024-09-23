import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
  constructor(private router: Router, private cookieService: CookieService) {}

  canActivate(): Observable<boolean> {
    const token = this.cookieService.get('token');

    if (token) {
      // Si el usuario ya está autenticado, redirigir a '/home'
      this.router.navigate(['/home']);
      return of(false); // No permitir acceso a la ruta
    } else {
      // Si no hay token, permitir acceso
      return of(true);
    }
  }
}
