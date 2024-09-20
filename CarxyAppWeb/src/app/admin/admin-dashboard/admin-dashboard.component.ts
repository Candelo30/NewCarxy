import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent {
  totalUsuarios: number = 150;
  totalPublicaciones: number = 300;
  totalModelos: number = 75;

  ultimasPublicaciones = [
    {
      usuario: { username: 'usuario1' },
      descripcion: 'Publicación de prueba 1',
      fecha_creacion: new Date('2023-09-01T12:34:56Z'),
    },
    {
      usuario: { username: 'usuario2' },
      descripcion: 'Publicación de prueba 2',
      fecha_creacion: new Date('2023-09-02T14:22:11Z'),
    },
    {
      usuario: { username: 'usuario3' },
      descripcion: 'Publicación de prueba 3',
      fecha_creacion: new Date('2023-09-03T09:15:00Z'),
    },
  ];

  comentariosRecientes = [
    {
      usuario: { username: 'usuario1' },
      comentario: 'Este es un comentario de prueba 1',
      fecha_comentario: new Date('2023-09-04T10:00:00Z'),
    },
    {
      usuario: { username: 'usuario2' },
      comentario: 'Este es un comentario de prueba 2',
      fecha_comentario: new Date('2023-09-05T11:30:00Z'),
    },
    {
      usuario: { username: 'usuario3' },
      comentario: 'Este es un comentario de prueba 3',
      fecha_comentario: new Date('2023-09-06T12:45:00Z'),
    },
  ];
}
