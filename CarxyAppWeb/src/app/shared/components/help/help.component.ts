import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './help.component.html',
  styleUrl: './help.component.css',
})
export class HelpComponent {
  articles = [
    {
      title: 'Cómo empezar con la aplicación',
      content:
        'Este artículo te guiará a través de los pasos iniciales para comenzar a usar la aplicación...',
      link: '#',
    },
    {
      title: 'Consejos para publicar contenido',
      content:
        'Aquí hay algunos consejos sobre cómo crear publicaciones efectivas...',
      link: '#',
    },
  ];

  faqs = [
    {
      question: '¿Cómo crear un nuevo usuario?',
      answer:
        'Para crear un nuevo usuario, dirígete a la sección de usuarios y haz clic en "Agregar Usuario".',
    },
    {
      question: '¿Cómo eliminar una publicación?',
      answer: 'Selecciona el botón "Eliminar" junto a la publicación deseada.',
    },
    {
      question: '¿Cómo cambiar mi contraseña?',
      answer: 'Ve a tu perfil y selecciona "Cambiar Contraseña".',
    },
  ];
}
