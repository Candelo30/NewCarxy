import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { forkJoin, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PublicationsService {
  constructor(
    private http: HttpClient,
    private cookies: CookieService,
    private router: Router
  ) {}

  DataPublications(): Observable<any> {
    return this.http.get('http://127.0.0.1:8000/api/publicaciones/');
  }

  postPublications(data: FormData): Observable<any> {
    return this.http.post('http://127.0.0.1:8000/api/publicaciones/', data);
  }
  dataAllPublications(): Observable<any> {
    return this.http.get('http://127.0.0.1:8000/api/allPublication/');
  }

  dataAllPublicationsForUser(id: number): Observable<any> {
    return this.http.get(
      `http://127.0.0.1:8000/api/allPublication/?user_id=${id}/`
    );
  }

  likePublicacion(publicacionId: number): Observable<any> {
    return this.http.post(
      `http://127.0.0.1:8000/api/allPublication/${publicacionId}/like/`,
      {}
    );
  }

  unlikePublicacion(publicacionId: number): Observable<any> {
    return this.http.post(
      `http://127.0.0.1:8000/api/allPublication/${publicacionId}/unlike/`,
      {}
    );
  }
  PostCommend(data: any): Observable<any> {
    return this.http.post('http://127.0.0.1:8000/comentarios/', data);
  }
  // Método para esperar que todos los datos sean cargados
  loadAllResources(): Observable<any> {
    // Si tienes otras peticiones, agrégalas a `forkJoin`
    return forkJoin({
      userDataPublications: this.DataPublications(),
      userDataAllPublications: this.dataAllPublications(),
      // Si tienes más peticiones, puedes agregarlas aquí:
      // otherData: this.http.get('otra-ruta-de-datos'),
    });
  }
}
