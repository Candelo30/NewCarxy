import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { UserService } from '../../../core/services/user.service';
import { LoadingButtonComponent } from '../loading-button/loading-button.component';
import { StatesService } from '../../../core/services/states.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, LoadingButtonComponent, FormsModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  isOpenMenu = false;
  userProfilePicture: string | null = null;
  userName: string = '';
  roleUser = false;
  selectedColor: string = '';
  isLoading = false;
  searchTerm: string = ''; // Para almacenar la entrada de búsqueda
  users: any[] = []; // Todos los usuarios
  filteredUsers: any[] = []; // Usuarios filtrados

  constructor(
    private elRef: ElementRef,
    private authService: AuthService,
    private UserData: UserService,
    private states: StatesService
  ) {}

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    // Verificar si el clic fue fuera del elemento modal
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isOpenMenu = false;
    }
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadAllUsers();
    this.states.getColor().subscribe((response) => {
      this.selectedColor = response;
    });
  }

  private loadUserData(): void {
    this.UserData.DataUser().subscribe((data) => {
      this.userName = data.username;
      this.roleUser = data.is_staff;
      if (data.foto_perfil) {
        this.userProfilePicture = 'http://localhost:8000/' + data.foto_perfil;
      }
    });
    // -----------------
  }

  ToggleMenu() {
    this.isOpenMenu = !this.isOpenMenu;
  }

  // Obtiene las iniciales del nombre
  getInitials(name: string): string {
    const initials = name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('');
    return initials.toUpperCase();
  }

  logout() {
    this.authService.logout();
  }

  // Método para cargar todos los usuarios
  private loadAllUsers(): void {
    this.UserData.DataAllUsers().subscribe((data) => {
      this.users = data; // Guarda todos los usuarios
      this.filteredUsers = data; // Inicialmente, mostrar todos los usuarios
      console.log('Datos filtrados', this.filteredUsers);
    });
  }

  // Método para filtrar usuarios
  filterUsers(): void {
    // Solo filtra si hay un término de búsqueda
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      this.filteredUsers = this.users.filter(
        (user) =>
          user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          (user.is_staff ? 'admin' : 'user').includes(
            this.searchTerm.toLowerCase()
          )
      );
    } else {
      // Si no hay término de búsqueda, no mostrar ningún usuario filtrado
      this.filteredUsers = [];
    }
  }
}
