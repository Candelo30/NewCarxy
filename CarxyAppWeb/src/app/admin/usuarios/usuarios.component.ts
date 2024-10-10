import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { NotificationsComponent } from '../../shared/components/notifications/notifications.component';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../interface/notifications/notification.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [HeaderComponent, RouterLink, CommonModule, NotificationsComponent],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})
export class UsuariosComponent {
  usuarios: any[] = []; // Almacenará la lista de usuarios
  loading: boolean = true;
  errorMessage: string = '';

  constructor(
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.loading = true;
    this.userService.DataAllUsers().subscribe({
      next: (data) => {
        this.usuarios = data || []; // Carga la lista de usuarios
      },
      error: (error) => {
        this.errorMessage =
          'Error al cargar los usuarios. Por favor intenta de nuevo.';
        console.error('Error loading users', error);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  agregarUsuario(): void {
    // Agregar una notificación de éxito
    const successNotification: Notification = {
      type: 'alert',
      message: 'Aún no esta en funcionamiento',
      style: 'info',
      duration: 3000, // Duración en milisegundos
      dismissible: true,
    };
    this.notificationService.addNotification(successNotification);
  }

  editarUsuario(usuarioId: number): void {
    // Lógica para abrir un formulario y editar el usuario con el ID proporcionado
    // Agregar una notificación de éxito
    const successNotification: Notification = {
      type: 'message',
      message: 'Aún no esta en funcionamiento',
      style: 'warning',
      duration: 3000, // Duración en milisegundos
      dismissible: true,
    };
    this.notificationService.addNotification(successNotification);
  }

  eliminarUsuario(usuarioId: number): void {
    const req = confirm(
      `¿Seguro que quieres eliminar al usuario ID: ${usuarioId}?`
    );

    if (req) {
      this.userService.deleteUsers(usuarioId).subscribe(
        (data) => {
          // Confirmar eliminación y luego llamar al servicio para eliminar el usuario
          const successNotification: Notification = {
            type: 'alert',
            message: 'Has eliminado al usuario correctamente',
            style: 'success',
            duration: 3000, // Duración en milisegundos
            dismissible: true,
          };
          this.notificationService.addNotification(successNotification);
          this.loadUsuarios();
        },
        (error) => {
          console.error(error);
          const errorMessage =
            error.status === 404
              ? 'Usuario no encontrado.'
              : `Ocurrió un error: ${error.statusText}`;

          const errorNotification: Notification = {
            type: 'message',
            message: errorMessage,
            style: 'error',
            duration: 3000, // Duración en milisegundos
            dismissible: true,
          };
          this.notificationService.addNotification(errorNotification);
        }
      );
    }
  }
}
