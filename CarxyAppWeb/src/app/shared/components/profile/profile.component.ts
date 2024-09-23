import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { UserService } from '../../../core/services/user.service';
import { StatesService } from '../../../core/services/states.service';

import { LoadingButtonComponent } from '../loading-button/loading-button.component';
import { PublicationsService } from '../../../core/services/publications.service';
import { response } from 'express';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    HeaderComponent,
    LoadingButtonComponent,
    CommonModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  //

  publicacionForm: FormGroup;
  isModalOpen: boolean = false;
  imagenPreview: string | ArrayBuffer | null = null;

  //

  selectedColor: string = '';
  idUser = 0;
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
    private PublicationData: PublicationsService,
    private fb: FormBuilder
  ) {
    this.publicacionForm = this.fb.group({
      descripcion: ['', [Validators.required, Validators.maxLength(255)]],
      imagen: [null],
    });
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.publicacionForm.reset();
    this.imagenPreview = null;
  }

  onImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result;
      };
      reader.readAsDataURL(file);
      this.publicacionForm.patchValue({
        imagen: file,
      });
    }
  }

  onSubmit() {
    if (this.publicacionForm.valid) {
      // Crear el objeto FormData
      const formData = new FormData();

      // Añadir la descripción al FormData
      formData.append(
        'descripcion',
        this.publicacionForm.get('descripcion')?.value
      );
      formData.append('usuario', this.idUser.toLocaleString());
      formData.append('megusta', '0');

      // Añadir la imagen (si existe)
      const imagen = this.publicacionForm.get('imagen')?.value;
      if (imagen) {
        formData.append('imagen', imagen);
      }

      // Enviar el FormData a través del servicio
      this.PublicationData.postPublications(formData).subscribe({
        next: (response) => {
          console.log('Publicación creada con éxito', response);
          this.closeModal(); // Cierra el modal si el post es exitoso
          alert('Sus datos han sido enviados correctamente');
          window.location.reload();
        },
        error: (err) => {
          console.error('Error creando la publicación', err);
        },
      });
    }
  }

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
        this.idUser = data.id;
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
