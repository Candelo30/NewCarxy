import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { RouterLink } from '@angular/router';
import { Notification } from '../../interface/notifications/notification.model';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Modelo3dService } from '../../core/services/modelo3d.service';

import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationsComponent } from '../../shared/components/notifications/notifications.component';
import { error } from 'console';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    HeaderComponent,
    RouterLink,
    ReactiveFormsModule,
    CommonModule,
    NotificationsComponent,
  ],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ConfiguracionComponent implements OnInit {
  @ViewChild('rendererContainer', { static: true })
  rendererContainer!: ElementRef;

  modeloForm: FormGroup;
  selectedFile: File | null = null;
  loading: boolean = false; // Indicador de carga
  progress: number = 0; // Progreso de carga
  idUser: any;
  modelPreviewUrl: string | null = null;
  modelos: any[] = []; // Listado de modelos

  constructor(
    private UserData: UserService,
    private fb: FormBuilder,
    private modelo3DService: Modelo3dService, // Servicio que debes haber creado
    private notificationService: NotificationService // Inyección del servicio de notificaciones
  ) {
    // Inicializamos el formulario0
    this.modeloForm = this.fb.group({
      nombre_modelo: ['', Validators.required],
      archivo_modelo: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadModelos();
  }

  //

  // Método para cargar los datos del usuario
  private loadUserData(): void {
    this.UserData.loadAllResources().subscribe({
      next: (resources) => {
        const data = resources.userData; // Datos del usuario

        // Asignar los valores a las propiedades del componente
        this.idUser = data.id;
      },
      error: (err) => {
        console.error('Error al cargar los datos', err);
      },
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && (file.name.endsWith('.glb') || file.name.endsWith('.gltf'))) {
      this.selectedFile = file;
      this.modeloForm.patchValue({ archivo_modelo: file });
      this.modeloForm.get('archivo_modelo')?.updateValueAndValidity();

      const url = URL.createObjectURL(file);
      this.modelPreviewUrl = url; // Asignar la URL para model-viewer
    } else {
      console.error('Solo se permiten archivos .glb o .gltf');
    }
  }

  // Método que se llama al enviar el formulario
  onSubmit(): void {
    console.log('Id del usuario: ', this.idUser);
    if (this.modeloForm.valid && this.selectedFile) {
      const formData: FormData = new FormData();
      formData.append(
        'nombre_modelo',
        this.modeloForm.get('nombre_modelo')?.value
      );
      formData.append('usuario', this.idUser);
      formData.append('archivo_modelo', this.selectedFile);

      this.modelo3DService.createModelo(formData).subscribe(
        (response) => {
          console.log('Modelo subido exitosamente', response);

          // Agregar una notificación de éxito
          const successNotification: Notification = {
            type: 'notification',
            message: 'Modelo subido exitosamente',
            style: 'success',
            duration: 3000, // Duración en milisegundos
            dismissible: true,
          };
          this.notificationService.addNotification(successNotification);
        },
        (error) => {
          console.error('Error al subir el modelo', error);

          // Agregar una notificación de error
          const errorNotification: Notification = {
            type: 'alert',
            message:
              'Error al subir el modelo: ' + (error.message || 'Desconocido'),
            style: 'error',
            duration: 5000, // Duración en milisegundos
            dismissible: true,
          };
          this.notificationService.addNotification(errorNotification);
        }
      );
      // Limpiar los campos del formulario sin borrar la vista previa
      this.modeloForm.reset(); // Limpia los campos del formulario
      this.selectedFile = null; // Permitir la selección de otro archivo
      this.modeloForm.markAsPristine(); // Opcional: marcar el formulario como no modificado
      this.modeloForm.markAsUntouched();
      this.loadModelos();
    } else {
      // Notificación si el formulario no es válido
      const warningNotification: Notification = {
        type: 'alert',
        message: 'Por favor, completa todos los campos requeridos.',
        style: 'warning',
        duration: 3000,
        dismissible: true,
      };
      this.notificationService.addNotification(warningNotification);
    }
  }

  loadModelos() {
    this.modelo3DService.getModelos().subscribe((next) => {
      this.modelos = next;
      console.log(this.modelos);
    });
  }

  // Eliminar un modelo
  eliminarModelo(id: number): void {
    this.modelo3DService.deleteModelo(id).subscribe({
      next: () => {
        this.notificationService.addNotification({
          type: 'notification',
          message: 'Modelo eliminado exitosamente',
          style: 'success',
          duration: 3000,
          dismissible: true,
        });
        this.loadModelos(); // Actualizar la lista
      },
      error: (err) => {
        console.error('Error al eliminar el modelo', err);
      },
    });
  }
}
