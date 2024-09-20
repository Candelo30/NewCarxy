import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { StatesService } from '../../../core/services/states.service';
import { LoadingButtonComponent } from '../loading-button/loading-button.component';
import { Subject, takeUntil } from 'rxjs';
import { PublicationsService } from '../../../core/services/publications.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent, LoadingButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  isLoading = false;
  publicaciones: any = [];
  selectedColor: string = '';
  userName = '';
  constructor(
    private PublicationData: PublicationsService,
    private state: StatesService,
    private UserData: UserService
  ) {
    this.state.getColor().subscribe((response) => {
      this.selectedColor = response;
    });
  }

  ngOnInit(): void {
    this.loadPublication();
    this.loadUserData();
  }

  private loadPublication(): void {
    this.isLoading = true;
    this.PublicationData.loadAllResources().subscribe({
      next: (response) => {
        const data = response.userDataAllPublications;
        this.publicaciones = data;
        this.isLoading = false;
      },
    });
  }

  // Método para cargar los datos del usuario
  private loadUserData(): void {
    this.isLoading = true;
    this.UserData.loadAllResources().subscribe({
      next: (resources) => {
        const data = resources.userData; // Datos del usuario

        // Asignar los valores a las propiedades del componente
        this.userName = data.username;

        this.isLoading = false; // Marcar como cargado
      },
      error: (err) => {
        console.error('Error al cargar los datos', err);
        this.isLoading = false; // Asegurarse de ocultar el cargador incluso si hay un error
      },
    });
  }

  //
  // Obtiene las iniciales del nombre
  getInitials(name: string): string {
    const initials = name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('');
    return initials.toUpperCase();
  }

  getSaludo(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return `Buenos días ☀️ @${this.userName}`;
    } else if (hour < 18) {
      return `Buenas tardes 🌗 @${this.userName}`;
    } else {
      return `Buenas noches 🌕 @${this.userName}`;
    }
  }
}
