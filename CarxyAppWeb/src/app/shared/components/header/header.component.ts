import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  isOpenMenu = false;
  userProfilePicture: string | null = null;
  userName: string = '';
  selectedColor: string = '';

  constructor(
    private cookieService: CookieService,
    private elRef: ElementRef,
    private authService: AuthService
  ) {
    this.selectedColor = this.getRandomColor();
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    // Verificar si el clic fue fuera del elemento modal
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.ToggleMenu();
    }
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    const loggedInUser = this.cookieService.get('loggedInUser');

    if (loggedInUser) {
      try {
        const user = JSON.parse(loggedInUser);
        this.userName = user.username;
      } catch (error) {
        console.error('Error al parsear los datos del usuario', error);
      }
    } else {
      console.warn('No se encontró información del usuario en las cookies');
    }
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

  // Genera un color de fondo aleatorio, solo se llama una vez
  getRandomColor(): string {
    const blueToPurple = [
      '#0000FF', // Azul
      '#1E90FF', // Azul Dodger
      '#4169E1', // Azul Real
      '#6A5ACD', // Azul Pizarra
      '#7B68EE', // Azul Pizarra Medio
      '#8A2BE2', // Azul Violeta
      '#9370DB', // Violeta Medio
      '#9400D3', // Púrpura Oscuro
      '#9932CC', // Orquídea Oscura
      '#BA55D3', // Orquídea Medio
      '#DA70D6', // Orquídea
      '#EE82EE', // Violeta
      '#DDA0DD', // Ciruela
      '#E6E6FA', // Lavanda
    ];

    const randomIndex = Math.floor(Math.random() * blueToPurple.length);
    return blueToPurple[randomIndex];
  }

  logout() {
    this.authService.logout();
  }
}
