import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { UserService } from '../../../core/services/user.service';
import { StatesService } from '../../../core/services/states.service';

import { LoadingButtonComponent } from '../loading-button/loading-button.component';
import { PublicationsService } from '../../../core/services/publications.service';
import { response } from 'express';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [HeaderComponent, LoadingButtonComponent, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  selectedColor: string = '';
  first_name = '';
  last_name = '';
  userName = '';
  date_joine = '';
  email = '';
  rolUser = true;
  userProfilePicture = '';
  isLoading = true;
  publicaciones: any = [];

  constructor(
    private UserData: UserService,
    private state: StatesService,
    private PublicationData: PublicationsService
  ) {}

  ngOnInit(): void {
    this.state.getColor().subscribe((response) => {
      this.selectedColor = response;
    });
    this.loadUserData();
    this.loadPublication();
  }

  private loadPublication(): void {
    this.PublicationData.loadAllResources().subscribe({
      next: (response) => {
        const data = response.userDataPublications;
        this.publicaciones = data;
        console.log('Los datos de la publicación', data);
      },
    });
  }

  // Método para cargar los datos del usuario
  private loadUserData(): void {
    this.UserData.loadAllResources().subscribe({
      next: (resources) => {
        const data = resources.userData; // Datos del usuario

        // Asignar los valores a las propiedades del componente
        this.userName = data.username;
        this.first_name = data.first_name;
        this.last_name = data.last_name;
        this.email = data.email;
        this.rolUser = data.is_staff;
        this.date_joine = this.formatearFecha(data.date_joined); // Formatear la fecha aquí

        if (data.foto_perfil) {
          this.userProfilePicture = 'http://localhost:8000/' + data.foto_perfil;
        }

        this.isLoading = false; // Marcar como cargado
      },
      error: (err) => {
        console.error('Error al cargar los datos', err);
        this.isLoading = false; // Asegurarse de ocultar el cargador incluso si hay un error
      },
    });
  }

  // Método para formatear la fecha
  formatearFecha(fechaISO: string): string {
    const fecha = new Date(fechaISO); // Convierte el string ISO a objeto Date
    if (isNaN(fecha.getTime())) {
      console.error('Fecha no válida');
      return 'Fecha no válida';
    }

    // Formato deseado: dd/mm/yyyy
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Los meses en JS van de 0 a 11
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
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
}
