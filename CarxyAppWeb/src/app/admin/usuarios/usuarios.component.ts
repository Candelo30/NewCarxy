import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { NotificationsComponent } from '../../shared/components/notifications/notifications.component';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../interface/notifications/notification.model';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    HeaderComponent,
    RouterLink,
    CommonModule,
    NotificationsComponent,
    FormsModule,
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})
export class UsuariosComponent {
  usuarios: any[] = []; // Almacenará la lista de usuarios
  loading: boolean = true;
  errorMessage: string = '';
  usuariosFiltrados: any[] = []; // La lista filtrada
  filtroUsuario: string = ''; // El texto del filtro
  nuevoUsuario: any = {
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  };
  usuarioEdicion: any = {
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  };
  modalEditVisible = false;

  constructor(
    private userService: UserService,
    private AuthService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUsuarios();
  }

  exportarAExcel() {
    // Crear un nuevo libro de trabajo
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.usuarios);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');

    // Generar archivo Excel
    const excelBuffer: any = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });
    const data: Blob = new Blob([excelBuffer], {
      type: this.EXCEL_TYPE,
    });

    // Guardar archivo Excel
    const fileName = 'usuarios.xlsx';
    saveAs(data, fileName);
  }

  EXCEL_TYPE =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  EXCEL_EXTENSION = '.xlsx';

  loadUsuarios(): void {
    this.loading = true;
    this.userService.DataAllUsers().subscribe({
      next: (data) => {
        this.usuarios = data || []; // Carga la lista de usuarios
        this.filtrarUsuarios();
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

  filtrarUsuarios() {
    const filtro = this.filtroUsuario.toLowerCase();
    this.usuariosFiltrados = this.usuarios.filter((usuario) =>
      usuario.username.toLowerCase().includes(filtro)
    );
  }

  modalVisible = false;

  abrirModal() {
    this.modalVisible = true;
  }

  cerrarModal() {
    this.modalVisible = false;
    // Reinicia el formulario
    this.nuevoUsuario = {
      username: '',
      email: '',
      password: '',
      role: 'usuario',
      foto_perfil: null,
    };
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.nuevoUsuario.foto_perfil = file; // Asigna el archivo de imagen
    }
  }

  guardarUsuario() {
    // Aquí puedes implementar la lógica para enviar los datos al backend
    this.AuthService.Registrar(this.nuevoUsuario).subscribe(
      (data: any) => {
        console.log('Usuario guardado:', data);
        this.cerrarModal(); // Cierra el modal después de guardar
        this.loadUsuarios();
      },
      (error: any) => {
        console.error('Error al guardar el usuario', error);
      }
    );
  }

  editarUsuario(usuarioId: number) {
    // Lógica para cargar el usuario y pre-poblar el modal de edición
    this.userService.getUserById(usuarioId).subscribe(
      (usuario: any) => {
        this.usuarioEdicion = { ...usuario }; // Pre-poblar con los datos del usuario
        this.modalEditVisible = true; // Mostrar el modal de edición
      },
      (error: any) => {
        console.error('Error al obtener el usuario', error);
      }
    );
  }

  cerrarModalEdit() {
    this.modalEditVisible = false;
    this.usuarioEdicion = {
      id: null,
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      password: '',
    }; // Reinicia el formulario
  }

  guardarCambios() {
    // Verificamos que el ID del usuario esté presente
    if (this.usuarioEdicion.id) {
      this.userService
        .updateUser(this.usuarioEdicion.id, this.usuarioEdicion)
        .subscribe(
          (data: any) => {
            console.log('Usuario actualizado:', data);
            this.cerrarModalEdit(); // Cierra el modal después de guardar
          },
          (error: any) => {
            console.error('Error al actualizar el usuario', error);
          }
        );
    }
  }
}
