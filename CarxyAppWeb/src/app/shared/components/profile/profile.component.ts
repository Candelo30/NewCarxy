import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { UserService } from '../../../core/services/user.service';
import { StatesService } from '../../../core/services/states.service';

import { LoadingButtonComponent } from '../loading-button/loading-button.component';
import { PublicationsService } from '../../../core/services/publications.service';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DetailsPublicationsComponent } from '../details-publications/details-publications.component';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../interface/notifications/notification.model';
import { NotificationsComponent } from '../notifications/notifications.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    HeaderComponent,
    LoadingButtonComponent,
    CommonModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    DetailsPublicationsComponent,
    NotificationsComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  //

  publicacionForm: FormGroup;
  isModalOpen: boolean = false;
  imagenPreview: string | ArrayBuffer | null = null;

  //

  selectedColor: string = '';
  idUser = 0;
  first_name = '';
  last_name = '';
  userName = '';
  date_joine = '';
  email = '';
  rolUser = true;
  userProfilePicture = '';
  isLoading = true;
  publicaciones: any = [];
  selectedPublicacion: any = null; // Almacena la publicación seleccionada

  constructor(
    private UserData: UserService,
    private state: StatesService,
    private PublicationData: PublicationsService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.publicacionForm = this.fb.group({
      descripcion: ['', [Validators.required, Validators.maxLength(255)]],
      imagen: [null],
    });
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

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.publicacionForm.reset();
    this.imagenPreview = null;
  }

  onImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result;
      };
      reader.readAsDataURL(file);
      this.publicacionForm.patchValue({
        imagen: file,
      });
    }
  }

  onSubmit() {
    if (this.publicacionForm.valid) {
      // Crear el objeto FormData
      const formData = new FormData();

      // Añadir la descripción al FormData
      formData.append(
        'descripcion',
        this.publicacionForm.get('descripcion')?.value
      );
      formData.append('usuario', this.idUser.toLocaleString());
      formData.append('megusta', '0');

      // Añadir la imagen (si existe)
      const imagen = this.publicacionForm.get('imagen')?.value;
      if (imagen) {
        formData.append('imagen', imagen);
      }

      // Enviar el FormData a través del servicio
      this.PublicationData.postPublications(formData).subscribe({
        next: (response) => {
          this.closeModal(); // Cierra el modal si el post es exitoso

          const warningNotification: Notification = {
            type: 'alert',
            message: 'Has hecho tu publicación con éxito.',
            style: 'success',
            duration: 3000,
            dismissible: true,
          };
          this.notificationService.addNotification(warningNotification);
          setTimeout(() => {
            window.location.reload();
          }, 4000);
        },
        error: (err) => {
          console.error('Error creando la publicación', err);
        },
      });
    }
  }

  ngOnInit(): void {
    this.state.getColor().subscribe((response) => {
      this.selectedColor = response;
    });
    this.loadUserData();
    this.loadPublication();
  }

  // userDataPublications

  loadPublication(): void {
    this.isLoading = true;

    // Llamada al servicio para cargar las publicaciones
    this.PublicationData.loadAllResources().subscribe({
      next: (response) => {
        const data = response.userDataPublications; // Suponemos que las publicaciones están en esta propiedad
        this.publicaciones = data; // Asignamos las publicaciones a la variable del componente

        console.log(data);

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
    this.UserData.loadAllResources().subscribe({
      next: (resources) => {
        const data = resources.userData; // Datos del usuario

        // Asignar los valores a las propiedades del componente
        this.idUser = data.id;
        this.userName = data.username;
        this.first_name = data.first_name;
        this.last_name = data.last_name;
        this.email = data.email;
        this.rolUser = data.is_staff;
        this.date_joine = this.formatearFecha(data.date_joined); // Formatear la fecha aquí

        if (data.foto_perfil) {
          this.userProfilePicture = 'http://localhost:8000/' + data.foto_perfil;
        }

        this.isLoading = false; // Marcar como cargado
      },
      error: (err) => {
        console.error('Error al cargar los datos', err);
        this.isLoading = false; // Asegurarse de ocultar el cargador incluso si hay un error
      },
    });
  }

  // Método para formatear la fecha
  formatearFecha(fechaISO: string): string {
    const fecha = new Date(fechaISO); // Convierte el string ISO a objeto Date
    if (isNaN(fecha.getTime())) {
      console.error('Fecha no válida');
      return 'Fecha no válida';
    }

    // Formato deseado: dd/mm/yyyy
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Los meses en JS van de 0 a 11
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }
  //
  // Obtiene las iniciales del nombre
  getInitials(name: string): string {
    const initials = name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('');
    return initials.toUpperCase();
  }
}
