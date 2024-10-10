import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PublicationsService } from '../../../core/services/publications.service';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-details-publications',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './details-publications.component.html',
  styleUrl: './details-publications.component.css',
})
export class DetailsPublicationsComponent implements OnInit {
  userName: any;
  constructor(
    private publicationsService: PublicationsService,
    private UserData: UserService
  ) {}
  @Input() publicacion: any; // Publicación que se recibe del componente padre
  @Input() selectedColor: string = '#000000'; // Color recibido del padre

  @Output() closeDetail = new EventEmitter<void>(); // Emite el evento para cerrar el detalle
  @Output() comentarioAgregado = new EventEmitter<void>();

  comentarioTexto: string = '';

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    this.UserData.DataUser().subscribe((data) => {
      this.userName = data.username;
    });
    // -----------------
  }

  getInitials(username: string): string {
    return username
      .split(' ')
      .map((n) => n[0])
      .join('');
  }

  agregarComentario() {
    if (this.comentarioTexto.trim() !== '') {
      const comentarioData = {
        publicacion: this.publicacion.id, // Asegúrate de que 'id' sea el ID de la publicación
        comentario: this.comentarioTexto,
      };

      // Llamar al servicio para enviar el comentario
      this.publicationsService.PostCommend(comentarioData).subscribe(
        (response) => {
          // Si la respuesta es exitosa, puedes actualizar la lista de comentarios aquí
          this.comentarioAgregado.emit(); // Emitir evento para notificar al componente padre
          this.comentarioTexto = ''; // Limpiar el campo de texto
        },
        (error) => {
          console.error('Error al agregar el comentario:', error);
          // Manejo de errores aquí (por ejemplo, mostrar un mensaje al usuario)
        }
      );
    }
  }

  cerrarDetalle() {
    this.closeDetail.emit(); // Emitir evento para cerrar el detalle
  }
}
