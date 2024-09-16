import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

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
}
