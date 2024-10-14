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
    private renderer: Renderer2
  ) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      foto_perfil: [null],
    });

    // Inicializar el formulario de seguridad
    this.securityForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadUserData();
    this.applyTheme();

    // Escuchar cambios en las preferencias del sistema si está en modo 'system'
    this.listenToSystemThemeChanges();
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
    if (this.securityForm.valid) {
      const password = this.securityForm.get('password')?.value;
      const confirmPassword = this.securityForm.get('confirmPassword')?.value;

      // Verificar que la contraseña y la confirmación coincidan
      if (password !== confirmPassword) {
        console.error('Las contraseñas no coinciden');
        return;
      }

      // Lógica para actualizar la contraseña
      this.userService.updatePassword(password).subscribe(
        (response) => {
          console.log('Contraseña actualizada con éxito!', response);
          this.securityForm.reset(); // Limpiar el formulario después de actualizar
        },
        (error) => {
          console.error('Error al actualizar la contraseña', error);
        }
      );
    }
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

  setTheme(theme: 'light' | 'dark' | 'system') {
    this.currentTheme = theme;

    if (theme === 'system') {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', theme);
    }

    this.applyTheme();
  }

  applyTheme() {
    const systemPrefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    const savedTheme = localStorage.getItem('theme');

    const isDarkMode =
      savedTheme === 'dark' || (savedTheme === null && systemPrefersDark);

    if (isDarkMode) {
      this.renderer.addClass(document.documentElement, 'dark');
    } else {
      this.renderer.removeClass(document.documentElement, 'dark');
    }
  }

  listenToSystemThemeChanges() {
    const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

    // Crear listener para detectar cambios en las preferencias del sistema
    const systemThemeChangeListener = (event: MediaQueryListEvent) => {
      if (this.currentTheme === 'system') {
        this.applyTheme(); // Actualiza el tema en tiempo real si está en modo 'system'
      }
    };

    // Añadir el listener a la media query
    mediaQueryList.addEventListener('change', systemThemeChangeListener);

    // Guardar referencia para poder removerlo más adelante
    this.systemThemeListener = () =>
      mediaQueryList.removeEventListener('change', systemThemeChangeListener);
  }
}
