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
    image: null,
  };
  imagePreview: string | ArrayBuffer | null = null;
  isOpenEditingFQA = false;
  isOpenEditingArticle = false;
  newFAQ: any = { question: '', answer: '' };
  valuesFQA: any = [];
  valuesArticle: any = [];
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

  openEditingArticle(article: any) {
    this.valuesArticle = { ...article }; // Asigna el artículo a editar
    this.imagePreview = article.imageUrl; // Asigna la URL de la imagen actual para la previsualización
    this.isOpenEditingArticle = true;
    console.log(this.valuesArticle);
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
          image: null,
        }; // Resetea el formulario
      },
      (error) => {
        console.error('Error adding article', error);
      }
    );
  }

  CloseEditingArticle() {
    this.valuesArticle = null;
    this.isOpenEditingArticle = false;
  }

  editArticle(article: any): void {
    const formData = new FormData();
    formData.append('title', article.title);
    formData.append('summary', article.summary);
    formData.append('content', article.content);

    // Solo agregar la imagen si ha sido seleccionada
    if (this.newArticle.image) {
      formData.append('image', this.newArticle.image);
    }

    this.helpService.updateArticle(article.id, formData).subscribe(
      (response) => {
        // Actualiza el artículo en la lista
        const index = this.articles.findIndex((a) => a.id === article.id);
        if (index > -1) {
          this.articles[index] = response; // Actualiza la lista
        }
        this.CloseEditingArticle(); // Cierra el modal después de guardar
        alert('Artículo actualizado con éxito.');
      },
      (error) => {
        console.error('Error updating article', error);
        alert(
          'Ocurrió un error al actualizar el artículo. Por favor, intenta de nuevo.'
        );
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

  openEditing(fqa: any) {
    this.valuesFQA = fqa;
    this.isOpenEditingFQA = true;
    console.log(this.valuesFQA);
  }

  CloseEditing() {
    this.valuesFQA = null;
    this.isOpenEditingFQA = false;
  }

  editFAQ(faq: any): void {
    // **1. Validación: Campos vacíos**
    const question = this.newFAQ.question?.trim();
    const answer = this.newFAQ.answer?.trim();

    if (!question || !answer) {
      console.error('La pregunta y la respuesta no pueden estar vacías.');
      alert('La pregunta y la respuesta no pueden estar vacías.');
      return;
    }

    // **2. Validación: Detectar si hubo cambios**
    const noChanges = faq.question === question && faq.answer === answer;

    if (noChanges) {
      console.log(
        'No se detectaron cambios en la pregunta ni en la respuesta.'
      );
      alert('No se detectaron cambios.');
      return;
    }

    // **3. Preparar el objeto actualizado**
    const updatedFAQ = { ...faq, question, answer };

    // **4. Llamada al servicio para actualizar la FAQ**
    this.helpService.updateFAQ(updatedFAQ).subscribe({
      next: (response) => {
        // **5. Actualizar la lista local**
        const index = this.faqs.findIndex((f) => f.id === faq.id);
        if (index > -1) {
          this.faqs[index] = response; // Reflejar cambios del backend en la lista local
        }
        console.log('FAQ actualizada con éxito:', response);
        alert('FAQ actualizada con éxito.');
        this.CloseEditing(); // Cerrar el modal
      },
      error: (error) => {
        console.error('Error al actualizar la FAQ:', error);
        alert('Error al actualizar la FAQ. Por favor, intenta de nuevo.');
      },
    });
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
