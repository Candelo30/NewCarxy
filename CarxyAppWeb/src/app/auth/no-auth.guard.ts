import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { catchError, map, Observable } from 'rxjs';
import { UserService } from '../core/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
  constructor(private router: Router, private userData: UserService) {}

  canActivate(): Observable<boolean> {
    return this.userData.DataUser().pipe(
      map((data) => {
        this.router.navigate(['/home']);
        return false;
      }),
      catchError((error) => {
        return [true];
      })
    );
  }
}
