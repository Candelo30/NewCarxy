import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StatesService } from '../../../core/services/states.service';
import { HeaderComponent } from '../header/header.component';
import { PublicationsService } from '../../../core/services/publications.service';
import { DetailsPublicationsComponent } from '../details-publications/details-publications.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, HeaderComponent, DetailsPublicationsComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent {
  userId: any;
  user: any;
  selectedColor: string = '';
  publicaciones: any = [];

  selectedPublicacion: any = null; // Almace

  constructor(
    private state: StatesService,
    private route: ActivatedRoute,
    private userService: UserService,
    private PublicationData: PublicationsService
  ) {}

  ngOnInit() {
    this.state.getColor().subscribe((response) => {
      this.selectedColor = response;
    });
    this.userId = this.route.snapshot.paramMap.get('id');
    this.loadUserProfile();
    this.loadPublication();
  }

  loadUserProfile() {
    this.userService.getUserById(this.userId).subscribe((user) => {
      this.user = user;
      console.log(this.user);
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

  // Maneja la selección de una publicación para mostrar el detalle
  seleccionarPublicacion(publicacion: any): void {
    this.selectedPublicacion = publicacion;
    console.log(this.selectedPublicacion);
  }

  // Cerrar el detalle de la publicación
  cerrarDetalle(): void {
    this.selectedPublicacion = null;
  }

  loadPublication(): void {
    // Llamada al servicio para cargar las publicaciones
    this.PublicationData.dataAllPublicationsForUser(this.userId).subscribe({
      next: (response) => {
        // Asignamos la respuesta directamente a publicaciones
        this.publicaciones = response; // Asegúrate de que esto sea un array de publicaciones

        console.log('Publicaciones cargadas:', this.publicaciones); // Muestra las publicaciones en consola

        // Aquí establecemos `likedByUser` basado en la respuesta del servidor
        this.publicaciones.forEach((pub: any) => {
          pub.likedByUser = pub.liked_by_user; // Asegúrate de que esta propiedad existe
          console.log('Publicación:', pub); // Muestra cada publicación para depuración
        });

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
        this.publicaciones = []; // Asegúrate de limpiar las publicaciones en caso de error
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
}
