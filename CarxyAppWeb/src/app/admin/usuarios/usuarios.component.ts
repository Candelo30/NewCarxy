import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [HeaderComponent, RouterLink],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})
export class UsuariosComponent {}
