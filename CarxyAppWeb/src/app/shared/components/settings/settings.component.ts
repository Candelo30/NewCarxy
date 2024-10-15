import { Component, OnInit, Renderer2 } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../interface/notifications/notification.model';
import { NotificationsComponent } from '../notifications/notifications.component';
import { CommonModule } from '@angular/common';
import { StatesService } from '../../../core/services/states.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    HeaderComponent,
    FormsModule,
    ReactiveFormsModule,
    NotificationsComponent,
    CommonModule,
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
  userForm: FormGroup;
  securityForm: FormGroup; // Formulario de seguridad
  user: any; // Define un modelo más específico si es necesario
  isThemeMenuOpen: boolean = false;
  currentTheme: 'light' | 'dark' | 'system' = 'system';
  private systemThemeListener!: () => void; // Almacena la referencia del listener

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private notificationService: NotificationService,
    private renderer: Renderer2,
    private statesService: StatesService
  ) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      foto_perfil: [null],
    });

    this.securityForm = this.fb.group({
      oldPassword: ['', Validators.required], // Control para la contraseña antigua
      password: ['', [Validators.required, Validators.minLength(6)]], // Control para la nueva contraseña
      confirmPassword: ['', Validators.required], // Control para confirmar la nueva contraseña
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.userService.DataUser().subscribe((data) => {
      this.user = data;
      this.userForm.patchValue(this.user); // Cargar datos en el formulario
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    this.userForm.patchValue({
      foto_perfil: file,
    });
  }

  updateUser(): void {
    const formData = new FormData();
    formData.append('username', this.userForm.get('username')?.value);
    formData.append('email', this.userForm.get('email')?.value);
    if (this.userForm.get('foto_perfil')?.value) {
      formData.append('foto_perfil', this.userForm.get('foto_perfil')?.value);
    }

    this.userService.updateUserProfile(formData).subscribe(
      (response) => {
        const warningNotification: Notification = {
          type: 'alert',
          message: 'Has actualizado tus datos con éxito.',
          style: 'success',
          duration: 3000,
          dismissible: true,
        };
        this.notificationService.addNotification(warningNotification);
        setTimeout(() => {
          window.location.reload();
        }, 4000);
      },
      (error) => {
        console.error('Error al actualizar el usuario', error);
      }
    );
  }

  updateSecurity(): void {
    if (this.securityForm.invalid) {
      console.error(
        'Formulario inválido. Asegúrate de completar todos los campos.'
      );
      alert('Por favor, completa todos los campos correctamente.');
      return;
    }

    const oldPassword = this.securityForm.get('oldPassword')?.value.trim();
    const newPassword = this.securityForm.get('password')?.value.trim(); // Cambiado a 'password'
    const confirmPassword = this.securityForm
      .get('confirmPassword')
      ?.value.trim();

    // Validación: Verificar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      console.error('Las contraseñas no coinciden.');
      alert(
        'Las contraseñas no coinciden. Por favor, verifica e intenta de nuevo.'
      );
      return;
    }

    // Lógica para actualizar la contraseña
    this.userService.updatePassword(oldPassword, newPassword).subscribe({
      next: (response) => {
        console.log('Contraseña actualizada con éxito!', response);
        alert('Contraseña actualizada con éxito.');
        this.securityForm.reset(); // Limpiar el formulario
      },
      error: (error) => {
        console.error('Error al actualizar la contraseña:', error);
        const errorMsg =
          error.error?.error ||
          'Ocurrió un error inesperado. Por favor, intenta de nuevo.';
        alert(errorMsg); // Mostrar mensaje de error del servidor o uno genérico
      },
    });
  }

  deleteUser(): void {
    if (confirm('¿Estás seguro de que quieres eliminar tu cuenta?')) {
      this.userService.deleteUserAccount().subscribe(
        () => {
          console.log('Cuenta eliminada con éxito');
          this.router.navigate(['/']); // Redirigir al usuario a la página principal
        },
        (error) => {
          console.error('Error al eliminar la cuenta', error);
        }
      );
    }
  }

  setTheme(theme: string): void {
    this.statesService.setTheme(theme);
  }
}
