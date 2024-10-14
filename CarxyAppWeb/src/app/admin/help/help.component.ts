import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { NotificationsComponent } from '../../shared/components/notifications/notifications.component';
import { RouterLink } from '@angular/router';
import { HelpService } from '../../core/services/help.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [
    HeaderComponent,
    NotificationsComponent,
    RouterLink,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './help.component.html',
  styleUrl: './help.component.css',
})
export class HelpComponent {
  articles: any[] = [];
  faqs: any[] = [];
  isLoading: boolean = true; // Para controlar el estado de carga
  newArticle: any = {
    title: '',
    summary: '',
    content: '',
    link: '',
    image: null,
  };
  newFAQ: any = { question: '', answer: '' };
  constructor(private helpService: HelpService) {}

  ngOnInit(): void {
    this.loadHelpArticles();
    this.loadFAQs();
  }

  loadHelpArticles(): void {
    this.helpService.getArticles().subscribe(
      (data) => {
        this.articles = data;
        this.isLoading = false; // Cambiamos el estado de carga a false
      },
      (error) => {
        console.error('Error loading help articles', error);
        this.isLoading = false; // Cambiamos el estado de carga a false incluso si hay error
      }
    );
  }

  loadFAQs(): void {
    this.helpService.getFAQs().subscribe(
      (data) => {
        this.faqs = data;
        this.isLoading = false; // Cambiamos el estado de carga a false
      },
      (error) => {
        console.error('Error loading FAQs', error);
        this.isLoading = false; // Cambiamos el estado de carga a false incluso si hay error
      }
    );
  }

  addArticle(): void {
    if (
      !this.newArticle.title ||
      !this.newArticle.summary ||
      !this.newArticle.content
    ) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    // Crear un objeto FormData para enviar datos del formulario
    const formData = new FormData();
    formData.append('title', this.newArticle.title);
    formData.append('summary', this.newArticle.summary);
    formData.append('content', this.newArticle.content);

    // Solo agregar el enlace si existe
    if (this.newArticle.link) {
      formData.append('link', this.newArticle.link);
    }

    // Solo agregar la imagen si existe
    if (this.newArticle.image) {
      formData.append('image', this.newArticle.image);
    }

    // Enviar la solicitud POST con FormData
    this.helpService.addArticle(formData).subscribe(
      (article) => {
        this.articles.push(article);
        this.newArticle = {
          title: '',
          summary: '',
          content: '',
          link: '',
          image: null,
        }; // Resetea el formulario
      },
      (error) => {
        console.error('Error adding article', error);
      }
    );
  }

  editArticle(article: any): void {
    const updatedArticle = { ...article, title: 'Nuevo Título' }; // Aquí puedes abrir un modal o un formulario con los datos del artículo
    this.helpService.updateArticle(updatedArticle).subscribe(
      (response) => {
        // Actualiza el artículo en la lista
        const index = this.articles.findIndex((a) => a.id === article.id);
        if (index > -1) {
          this.articles[index] = updatedArticle; // Actualiza la lista
        }
      },
      (error) => {
        console.error('Error updating article', error);
      }
    );
  }

  deleteArticle(id: number): void {
    this.helpService.deleteArticle(id).subscribe(
      () => {
        this.articles = this.articles.filter((article) => article.id !== id);
      },
      (error) => {
        console.error('Error deleting article', error);
      }
    );
  }

  addFAQ(): void {
    if (!this.newFAQ.question || !this.newFAQ.answer) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    this.helpService.addFAQ(this.newFAQ).subscribe(
      (faq) => {
        this.faqs.push(faq);
        this.newFAQ = { question: '', answer: '' }; // Resetea el formulario
      },
      (error) => {
        console.error('Error adding FAQ', error);
      }
    );
  }

  editFAQ(faq: any): void {
    const updatedFAQ = { ...faq, question: 'Nueva Pregunta' }; // Aquí puedes abrir un modal o un formulario con los datos de la pregunta
    this.helpService.updateFAQ(updatedFAQ).subscribe(
      (response) => {
        // Actualiza la FAQ en la lista
        const index = this.faqs.findIndex((f) => f.id === faq.id);
        if (index > -1) {
          this.faqs[index] = updatedFAQ; // Actualiza la lista
        }
      },
      (error) => {
        console.error('Error updating FAQ', error);
      }
    );
  }

  deleteFAQ(id: number): void {
    this.helpService.deleteFAQ(id).subscribe(
      () => {
        this.faqs = this.faqs.filter((faq) => faq.id !== id);
      },
      (error) => {
        console.error('Error deleting FAQ', error);
      }
    );
  }

  onImageSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.newArticle.image = fileInput.files[0]; // Asegúrate de asignar el archivo correctamente
    }
  }
}
