import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NotificationsComponent } from '../../shared/components/notifications/notifications.component';
import { Notification } from '../../interface/notifications/notification.model';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingButtonComponent } from '../../shared/components/loading-button/loading-button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    NotificationsComponent,
    LoadingButtonComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  username = '';
  password = '';
  isLoading = false;

  constructor(
    public userService: AuthService,
    public router: Router,
    private notificationService: NotificationService
  ) {}

  Login() {
    this.isLoading = true;
    const user = { username: this.username, password: this.password };

    this.userService.IniciarSesion(user).subscribe(
      (data) => {
        if (data.token) {
          // Notificación de éxito
          const successNotification: Notification = {
            type: 'notification',
            message: 'Has iniciado sesión correctamente',
            style: 'success',
            duration: 3000, // Duración en milisegundos
            dismissible: true,
          };
          this.notificationService.addNotification(successNotification);

          this.userService.AsignarToken(data.token);
          setTimeout(() => {
            this.router.navigate(['/home']);
            this.isLoading = false;
          }, 3000); // Espera 3 segundos antes de redirigir
        }
      },
      (error) => {
        // Notificación de error
        this.isLoading = false;
        const errorNotification: Notification = {
          type: 'notification',
          message:
            'Error al iniciar sesión. Verifica tus credenciales e intenta de nuevo.',
          style: 'error',
          duration: 5000, // Duración en milisegundos
          dismissible: true,
        };
        this.notificationService.addNotification(errorNotification);
      }
    );
  }
}
