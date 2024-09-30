import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { PublicationsService } from '../../core/services/publications.service';
import { forkJoin } from 'rxjs';
import { Modelo3dService } from '../../core/services/modelo3d.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  totalUsuarios: number = 0;
  totalPublicaciones: number = 0;
  totalModelos: number = 0;
  ultimasPublicaciones: any[] = [];
  comentariosRecientes: any[] = [];
  loading: boolean = true;
  errorMessage: string = '';

  constructor(
    private userService: UserService,
    private publicationsService: PublicationsService,
    private Models3D: Modelo3dService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    // Usamos `forkJoin` para hacer múltiples peticiones simultáneas
    forkJoin({
      userAllData: this.userService.DataAllUsers(),
      publicationData: this.publicationsService.dataAllPublications(),
    }).subscribe({
      next: (data) => {
        // Longitudes de los arrays para obtener el total
        this.Models3D.getModelos().subscribe((data) => {
          this.totalModelos = data.length || 0;
        });

        this.totalUsuarios = data.userAllData.length || 0; // Total de usuarios
        this.totalPublicaciones = data.publicationData.length || 0; // Total de publicaciones

        // Obtener las últimas 5 publicaciones
        this.ultimasPublicaciones = data.publicationData.slice(0, 5) || [];

        // Obtener todos los comentarios recientes de todas las publicaciones
        this.comentariosRecientes = data.publicationData.reduce(
          (acc: any, pub: any) => {
            return acc.concat(pub.comentarios); // Combina todos los comentarios en un solo array
          },
          []
        );

        console.log('Últimas Publicaciones:', this.ultimasPublicaciones);
        console.log('Comentarios Recientes:', this.comentariosRecientes);
      },
      error: (error) => {
        this.errorMessage =
          'Error al cargar los datos, por favor intenta de nuevo.';
        console.error('Error loading data', error);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
