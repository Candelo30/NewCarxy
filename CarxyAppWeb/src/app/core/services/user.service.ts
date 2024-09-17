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

  // Método para esperar que todos los datos sean cargados
  loadAllResources(): Observable<any> {
    // Si tienes otras peticiones, agrégalas a `forkJoin`
    return forkJoin({
      userData: this.DataUser(),
      // Si tienes más peticiones, puedes agregarlas aquí:
      // otherData: this.http.get('otra-ruta-de-datos'),
    });
  }
}
