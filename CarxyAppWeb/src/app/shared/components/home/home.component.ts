import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { StatesService } from '../../../core/services/states.service';
import { LoadingButtonComponent } from '../loading-button/loading-button.component';
import { Subject, takeUntil } from 'rxjs';
import { PublicationsService } from '../../../core/services/publications.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { DetailsPublicationsComponent } from '../details-publications/details-publications.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    LoadingButtonComponent,
    DetailsPublicationsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  isLoading = false;
  publicaciones: any = [];
  selectedColor: string = '';
  selectedPublicacion: any = null; // Almacena la publicación seleccionada
  userName = '';
  constructor(
    private PublicationData: PublicationsService,
    private state: StatesService,
    private UserData: UserService
  ) {
    this.state.getColor().subscribe((response) => {
      this.selectedColor = response;
    });
  }

  ngOnInit(): void {
    this.loadPublication();
    this.loadUserData();
  }

  // Maneja la selección de una publicación para mostrar el detalle
  seleccionarPublicacion(publicacion: any): void {
    this.loadPublication();
    this.selectedPublicacion = publicacion;
    console.log(this.selectedPublicacion);
  }

  // Cerrar el detalle de la publicación
  cerrarDetalle(): void {
    this.selectedPublicacion = null;
    this.loadPublication();
  }

  loadPublication(): void {
    this.isLoading = true;

    // Llamada al servicio para cargar las publicaciones
    this.PublicationData.loadAllResources().subscribe({
      next: (response) => {
        const data = response.userDataAllPublications; // Suponemos que las publicaciones están en esta propiedad
        this.publicaciones = data; // Asignamos las publicaciones a la variable del componente

        // Aquí establecemos `likedByUser` basado en la respuesta del servidor
        this.publicaciones.forEach((pub: any) => {
          pub.likedByUser = pub.liked_by_user; // Cambiamos esto para leer directamente desde cada publicación
        });
        this.isLoading = false; // Desactivamos el indicador de carga

        // Si hay una publicación seleccionada, actualizamos la referencia con los nuevos datos
        if (this.selectedPublicacion) {
          const updatedPublicacion = this.publicaciones.find(
            (pub: any) => pub.id === this.selectedPublicacion.id
          );

          // Actualizamos la publicación seleccionada solo si la encontramos en los datos recargados
          if (updatedPublicacion) {
            this.selectedPublicacion = updatedPublicacion;
          } else {
            // Si la publicación seleccionada ya no existe en la lista, deseleccionamos
            this.selectedPublicacion = null;
          }
        }
      },
      error: (err) => {
        console.error('Error al cargar las publicaciones:', err);
        this.isLoading = false; // Desactivamos el indicador de carga incluso si hay un error
      },
    });
  }

  toggleLike(publicacion: any): void {
    this.PublicationData.likePublicacion(publicacion.id).subscribe({
      next: (response) => {
        // Manejar la respuesta del servidor
        if (response.status === 'liked') {
          publicacion.megusta += 1; // Aumentar el contador de "me gusta"
          publicacion.likedByUser = true; // Actualizar estado de "me gusta"
        } else {
          publicacion.megusta -= 1; // Disminuir el contador de "me gusta"
          publicacion.likedByUser = false; // Actualizar estado de "me gusta"
        }
      },
      error: (err) => {
        console.error('Error al cambiar el like:', err);
        // Manejo de error, tal vez mostrar un mensaje al usuario
      },
    });
  }

  // Método para cargar los datos del usuario
  private loadUserData(): void {
    this.isLoading = true;
    this.UserData.loadAllResources().subscribe({
      next: (resources) => {
        const data = resources.userData; // Datos del usuario

        // Asignar los valores a las propiedades del componente
        this.userName = data.username;

        this.isLoading = false; // Marcar como cargado
      },
      error: (err) => {
        console.error('Error al cargar los datos', err);
        this.isLoading = false; // Asegurarse de ocultar el cargador incluso si hay un error
      },
    });
  }

  // Obtiene las iniciales del nombre
  getInitials(name: string): string {
    const initials = name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('');
    return initials.toUpperCase();
  }

  getSaludo(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return `Buenos días ☀️ @${this.userName}`;
    } else if (hour < 18) {
      return `Buenas tardes 🌗 @${this.userName}`;
    } else {
      return `Buenas noches 🌕 @${this.userName}`;
    }
  }
}
