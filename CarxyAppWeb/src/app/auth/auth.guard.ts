import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UserService } from '../core/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private userData: UserService) {}

  canActivate(): Observable<boolean> {
    return this.userData.DataUser().pipe(
      map((data) => {
        // Si el usuario ya está autenticado, permitir el acceso a la ruta
        return true;
      }),
      catchError((error) => {
        // Si hay un error (usuario no autenticado), redirigir al login
        this.router.navigate(['/login']);
        return [false]; // Devolver un observable con `false`
      })
    );
  }
}
