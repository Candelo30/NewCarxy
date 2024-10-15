import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { StatesService } from '../../../core/services/states.service';
import { LoadingButtonComponent } from '../loading-button/loading-button.component';
import { Subject, takeUntil } from 'rxjs';
import { PublicationsService } from '../../../core/services/publications.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { DetailsPublicationsComponent } from '../details-publications/details-publications.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
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
  mensajeSaludo: string = '🎉 ¡Bienvenido!';
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
    this.cambiarMensaje();
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

    this.PublicationData.loadAllResources().subscribe({
      next: (response) => {
        this.publicaciones = response.userDataAllPublications;

        this.publicaciones.forEach((pub: any) => {
          pub.likedByUser = pub.liked_by_user;
        });

        this.isLoading = false;
        // Ordenar las publicaciones de más nuevas a más viejas
        this.publicaciones.sort((a: any, b: any) => {
          return (
            new Date(b.fecha_creacion).getTime() -
            new Date(a.fecha_creacion).getTime()
          );
        });

        // Aquí aseguramos que se recargue la publicación seleccionada
        if (this.selectedPublicacion) {
          const updatedPublicacion = this.publicaciones.find(
            (pub: any) => pub.id === this.selectedPublicacion.id
          );
          this.selectedPublicacion = updatedPublicacion ?? null;
        }
      },
      error: (err) => {
        console.error('Error al cargar las publicaciones:', err);
        this.isLoading = false;
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

  cambiarMensaje() {
    const mensajes = [
      '🎉 ¡Bienvenido!',
      '✨ Explora las publicaciones recientes',
      '🚀 Comparte tus experiencias',
    ];
    let index = 0;
    setInterval(() => {
      this.mensajeSaludo = mensajes[index];
      index = (index + 1) % mensajes.length;
    }, 3000); // Cambia cada 3 segundos
  }

  getSaludo(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return `Buenos días ☀️`;
    } else if (hour < 18) {
      return `Buenas tardes 🌗`;
    } else {
      return `Buenas noches 🌕`;
    }
  }
}
