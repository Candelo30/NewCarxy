import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HelpService {
  private apiUrl = 'http://localhost:8000'; // Cambia esto por la URL de tu backend

  constructor(private http: HttpClient) {}

  getArticles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/help-articles/`);
  }

  addArticle(article: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/help-articles/`, article);
  }

  updateArticle(articleId: number, formData: FormData): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/api/help-articles/${articleId}/`,
      formData
    );
  }

  deleteArticle(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/help-articles/${id}/`);
  }

  getFAQs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/faqs/`);
  }

  addFAQ(faq: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/faqs/`, faq);
  }

  updateFAQ(faq: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/api/faqs/${faq.id}/`, faq);
  }

  deleteFAQ(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/faqs/${id}/`);
  }
}
