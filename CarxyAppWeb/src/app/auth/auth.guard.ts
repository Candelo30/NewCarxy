import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private cookieService: CookieService) {}

  canActivate(): boolean {
    const loggedInUser = this.cookieService.get('token');

    if (loggedInUser) {
      // Si el usuario ya está autenticado, permitir el acceso a la ruta
      return true;
    } else {
      // Si no está autenticado, redirigir a '/login'
      this.router.navigate(['/login']);
      return false;
    }
  }
}
