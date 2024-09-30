import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [HeaderComponent, RouterLink, CommonModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})
export class UsuariosComponent {
  usuarios: any[] = []; // Almacenará la lista de usuarios
  loading: boolean = true;
  errorMessage: string = '';

  constructor(private userService: UserService) {}

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
    // Lógica para abrir un formulario y agregar un nuevo usuario
  }

  editarUsuario(usuarioId: number): void {
    // Lógica para abrir un formulario y editar el usuario con el ID proporcionado
  }

  eliminarUsuario(usuarioId: number): void {
    // Confirmar eliminación y luego llamar al servicio para eliminar el usuario
  }
}
