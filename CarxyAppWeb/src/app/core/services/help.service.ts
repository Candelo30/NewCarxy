import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HelpService {
  private apiUrl = 'http://localhost:8000'; // Cambia esto por la URL de tu backend

  constructor(private http: HttpClient) {}

  getArticles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/help-articles/`);
  }

  getFAQs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/faqs/`);
  }
}
