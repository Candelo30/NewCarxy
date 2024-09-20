import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})
export class UsuariosComponent {}
