import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PersonalizacionService } from '../../core/services/personalizacion.service';

@Component({
  selector: 'app-panel-desing',
  standalone: true,
  imports: [HeaderComponent, CommonModule, RouterLink],
  templateUrl: './panel-desing.component.html',
  styleUrl: './panel-desing.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PanelDesingComponent implements OnInit {
  listCartsDesing: any[] = [];
  isModalOpen: boolean = false;

  constructor(
    private personalizacionService: PersonalizacionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPersonalizaciones();
  }

  loadPersonalizaciones(): void {
    this.personalizacionService.getPersonalizaciones().subscribe(
      (data) => {
        this.listCartsDesing = data; // Asignar los datos obtenidos a la lista
        console.log(this.listCartsDesing);
      },
      (error) => {
        console.error('Error al cargar personalizaciones:', error);
      }
    );
  }

  openModal() {
    this.isModalOpen = true;
  }

  // Métodos para acciones en los iconos
  copyCar(id: number): void {
    console.log('Copia del coche con ID:', id);
  }

  editCar(id: number): void {
    console.log('Edición del coche con ID:', id);
    this.router.navigate([`/personalizacion/edit/${id}`]); // Navegar a la página de edición
  }

  deleteCar(id: number): void {
    console.log('Eliminación del coche con ID:', id);
    this.personalizacionService.eliminarPersonalizacion(id).subscribe(
      () => {
        this.loadPersonalizaciones(); // Recargar la lista después de eliminar
      },
      (error) => {
        console.error('Error al eliminar personalización:', error);
      }
    );
  }

  viewPreview(id: number): void {
    this.router.navigate([`/personalizacion/preview/${id}`]); // Navegar a la vista previa
  }
}
