import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PersonalizacionService } from '../../core/services/personalizacion.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { Modelo3dService } from '../../core/services/modelo3d.service';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../interface/notifications/notification.model';
import { NotificationsComponent } from '../../shared/components/notifications/notifications.component';
@Component({
  selector: 'app-panel-desing',
  standalone: true,
  imports: [
    HeaderComponent,
    CommonModule,
    RouterLink,
    FormsModule,
    NotificationsComponent,
  ],
  templateUrl: './panel-desing.component.html',
  styleUrl: './panel-desing.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PanelDesingComponent implements OnInit {
  imagenPreview: string | ArrayBuffer | null = null;
  listCartsDesing: any = [];
  isModalOpen: boolean = false;
  modeloSeleccionado: any = null;

  modelos3D: any = []; // Aquí cargarás los modelos 3D desde tu backend
  newPersonalization: any = {
    nombre_personalizacion: '',
    modelo: null,
  };
  userId = 0;

  // Actualizar la vista previa cuando el modelo cambia
  onModeloChange(event: any) {
    this.modeloSeleccionado = this.newPersonalization.modelo;
  }

  constructor(
    private modelo3DService: Modelo3dService, // Servicio que debes haber creado
    private personalizacionService: PersonalizacionService,
    private router: Router,
    private UserData: UserService,
    private notificationService: NotificationService
  ) {}

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;

    this.imagenPreview = null;
  }

  ngOnInit(): void {
    this.loadUserData();
  }
  // Este método se puede usar para cargar los modelos desde el backend
  loadModelos3D() {
    this.modelo3DService.getModelos().subscribe((modelos) => {
      this.modelos3D = modelos;
    });
  }

  createPersonalization() {
    const modeloId = this.newPersonalization.modelo
      ? this.newPersonalization.modelo.id
      : null;

    if (modeloId) {
      const personalizationData = {
        nombre_personalizacion: this.newPersonalization.nombre_personalizacion,
        modelo_id: modeloId, // Solo el ID del modelo
      };

      this.personalizacionService
        .crearPersonalizacion(personalizationData)
        .subscribe(
          (response) => {
            this.closeModal();
            this.loadPersonalizaciones(); // Recargar la lista de personalizaciones
            const warningNotification: Notification = {
              type: 'alert',
              message: 'Has creado una nueva personalización.',
              style: 'warning',
              duration: 3000,
              dismissible: true,
            };
            this.notificationService.addNotification(warningNotification);
          },
          (error) => {
            console.error('Error creando la personalización', error);
          }
        );
    } else {
      console.error('No se ha seleccionado un modelo válido.');
    }
  }

  // Método para cargar los datos del usuario
  private loadUserData(): void {
    this.UserData.loadAllResources().subscribe({
      next: (resources) => {
        const data = resources.userData; // Datos del usuario
        this.userId = data.id;

        // Asignar los valores a las propiedades del componente
        this.loadPersonalizaciones();
        this.loadModelos3D();
      },
      error: (err) => {
        console.error('Error al cargar los datos', err);
      },
    });
  }

  loadPersonalizaciones(): void {
    this.personalizacionService.getPersonalizaciones().subscribe(
      (data) => {
        this.listCartsDesing = data;
      },
      (error) => {
        console.error('Error al cargar personalizaciones:', error);
      }
    );
  }

  // Métodos para acciones en los iconos
  copyCar(id: number): void {}

  editCar(id: number): void {
    console.log('Edición del coche con ID:', id);
    this.router.navigate([`/personalizacion/edit/${id}`]); // Navegar a la página de edición
  }

  deleteCar(id: number): void {
    const req = confirm('Seguro que quieres borrara la personalización');
    if (req) {
      this.personalizacionService.eliminarPersonalizacion(id).subscribe(
        () => {
          this.loadPersonalizaciones(); // Recargar la lista después de eliminar
        },
        (error) => {
          console.error('Error al eliminar personalización:', error);
        }
      );
    } else {
    }
  }

  viewPreview(id: number): void {
    this.router.navigate([`/personalizacion/preview/${id}`]); // Navegar a la vista previa
  }
}
