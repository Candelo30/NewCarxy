import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PersonalizacionService } from '../../core/services/personalizacion.service';
import { ParteService } from '../../core/services/parte.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-view-cars',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './view-cars.component.html',
  styleUrl: './view-cars.component.css',
})
export class ViewCarsComponent implements OnInit {
  @ViewChild('rendererContainer', { static: true })
  rendererContainer!: ElementRef;

  isloading = true;
  // Variables relacionadas con el estado del diseño
  loading = true;
  progress = 0;
  titleCar = 'Coche Ejemplo'; // Nombre de diseño del coche (hardcoded)
  saveDesingStatus: boolean = false;
  id: any;
  userId = 0;

  // Variables para los controles de rango
  rotationX: number = 0;
  rotationY: number = 0;
  rotationZ: number = 0;
  positionX: number = 0;
  positionY: number = 0;
  positionZ: number = 0;

  // Three.js
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  public model: THREE.Object3D | null = null;

  private controls!: OrbitControls;
  public parts: THREE.Object3D[] = [];
  private currentOutline: THREE.Mesh | null = null;
  private selectedPart: THREE.Mesh | null = null;
  private originalColors: Map<THREE.Mesh, THREE.Color> = new Map();
  private highlightLight!: THREE.PointLight;

  // Colores para coches
  colorList = [
    { id: 1, name: 'Negro', hex: '#000000' },
    { id: 2, name: 'Blanco', hex: '#FFFFFF' },
    { id: 3, name: 'Gris', hex: '#808080' },
    { id: 4, name: 'Rojo', hex: '#FF0000' },
    { id: 5, name: 'Azul Marino', hex: '#000080' },
    { id: 6, name: 'Plata', hex: '#C0C0C0' },
    { id: 7, name: 'Verde Esmeralda', hex: '#50C878' },
    { id: 8, name: 'Amarillo', hex: '#FFFF00' },
    { id: 9, name: 'Naranja', hex: '#FFA500' },
    { id: 10, name: 'Vino', hex: '#800000' },
    { id: 11, name: 'Beige', hex: '#F5F5DC' },
    { id: 12, name: 'Marrón', hex: '#A52A2A' },
  ];

  constructor(
    private personalizacionService: PersonalizacionService,
    private PartsService: ParteService,
    private route: ActivatedRoute,
    private UserData: UserService
  ) {}

  ngOnInit(): void {
    // Escucha el evento de redimensionar la ventana
    window.addEventListener('resize', this.onWindowResize.bind(this));
    this.saveDesingStatus = localStorage.getItem('saveDesingStatus') === 'true';
    window.addEventListener('beforeunload', (event) => {
      if (!this.saveDesingStatus) {
        event.returnValue =
          'Tienes cambios no guardados. ¿Seguro que quieres salir?';
      }
    });
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id');

      // Ejecuta loadPersonalizaciones solo cuando ya tienes el ID.
      if (this.id) {
        this.loadPersonalizaciones();
        this.loadUserData();
      }
    });
  }

  onWindowResize(): void {
    // Verifica si la cámara y el renderer están inicializados
    if (this.camera && this.renderer) {
      const container = this.rendererContainer.nativeElement;

      // Actualizar el tamaño del renderer
      this.renderer.setSize(container.offsetWidth, container.offsetHeight);

      // Actualizar la relación de aspecto de la cámara
      this.camera.aspect = container.offsetWidth / container.offsetHeight;
      this.camera.updateProjectionMatrix(); // Necesario para actualizar la cámara
    }
  }

  // Método para cargar los datos del usuario
  private loadUserData(): void {
    this.UserData.loadAllResources().subscribe({
      next: (resources) => {
        const data = resources.userData; // Datos del usuario
        this.userId = data.id;

        // Asignar los valores a las propiedades del componente
      },
      error: (err) => {
        console.error('Error al cargar los datos', err);
      },
    });
  }

  listCartsDesing: any = [];

  loadPersonalizaciones(): void {
    this.personalizacionService.getPersonalizacionesPorID(this.id).subscribe(
      (data) => {
        this.listCartsDesing = data.modelo;
        console.log(this.listCartsDesing);
        this.titleCar = data.nombre_personalizacion;

        this.createScene();
        this.loadModel();

        // Cargar las partes personalizadas
        this.PartsService.getPartesPorModelo(this.id).subscribe(
          (partes) => {
            this.applySavedParts(partes); // Aplica los colores guardados
          },
          (error) => {
            console.error('Error al cargar las partes personalizadas:', error);
          }
        );
      },
      (error) => {
        console.error('Error al cargar personalizaciones:', error);
      }
    );
  }

  reloadModel(): void {
    // Eliminar el modelo actual de la escena
    if (this.model) {
      this.scene.remove(this.model);
      this.model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          (child.material as THREE.MeshStandardMaterial).dispose();
        }
      });
      this.model = null; // Asegúrate de que el modelo esté nulo después de eliminarlo
      this.saveDesingStatus = false;
    }

    // Volver a cargar el modelo
    this.loadModel();
  }

  applySavedParts(partes: any[]): void {
    partes.forEach((parte) => {
      const partObject = this.parts.find((p) => p.name === parte.nombre_parte);
      if (partObject) {
        const material = (partObject as THREE.Mesh)
          .material as THREE.MeshStandardMaterial;
        material.color.set(parte.color); // Aplica el color guardado
      }
    });
  }

  createScene(): void {
    this.scene = new THREE.Scene();

    // Configuración de la cámara
    this.camera = new THREE.PerspectiveCamera(
      30,
      this.rendererContainer.nativeElement.offsetWidth /
        this.rendererContainer.nativeElement.offsetHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 100);

    // Configuración del renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(
      this.rendererContainer.nativeElement.offsetWidth,
      this.rendererContainer.nativeElement.offsetHeight
    );
    this.renderer.setClearColor(0x000000, 0);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    // Luz ambiental
    const ambientLight = new THREE.AmbientLight(0x404040, 50);
    this.scene.add(ambientLight);

    // Luz direccional
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(100, 100, 100).normalize();
    this.scene.add(directionalLight);

    // Luz puntual para resaltar partes seleccionadas
    this.highlightLight = new THREE.PointLight(0xffffff, 2, 50);
    this.scene.add(this.highlightLight);
    this.highlightLight.visible = false;

    // Controles de órbita
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.enableZoom = true;

    // Animación
    const animate = () => {
      requestAnimationFrame(animate);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  private loadModel(): void {
    const loader = new GLTFLoader();
    loader.load(
      `${this.listCartsDesing.archivo_modelo}`, // Ruta del modelo GLB
      (gltf) => {
        // Antes de cargar el nuevo modelo, limpiamos el modelo anterior si existe
        if (this.model) {
          this.scene.remove(this.model);
          this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.geometry.dispose();
              (child.material as THREE.MeshStandardMaterial).dispose();
            }
          });
        }

        // Cargar el nuevo modelo
        this.model = gltf.scene;
        this.model.scale.set(0.1, 0.1, 0.1);
        this.model.position.set(0, 0, 0);
        this.scene.add(this.model);

        // Limpiar la lista de partes antes de dividir el nuevo modelo
        this.parts = []; // Limpiar las partes existentes
        this.splitModelIntoParts();

        // Después de cargar el modelo, carga las partes personalizadas
        this.PartsService.getPartesPorModelo(this.id).subscribe(
          (partes) => {
            this.applySavedParts(partes); // Aplica los colores guardados
          },
          (error) => {
            console.error('Error al cargar las partes personalizadas:', error);
          }
        );

        // Ocultar indicador de carga
        this.loading = false;
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          this.progress = (xhr.loaded / xhr.total) * 100;
        }
      },
      (error) => {
        console.error('Error al cargar el modelo:', error);
        this.loading = false;
      }
    );
  }

  splitModelIntoParts(): void {
    this.model?.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const originalColor = new THREE.Color(
          (child.material as THREE.MeshStandardMaterial).color.getHex()
        );
        this.originalColors.set(child, originalColor);
        child.name = child.name || `Parte ${this.parts.length + 1}`;
        this.parts.push(child);
      }
    });
  }

  changeModelColor(color: string): void {
    this.saveDesingStatus = false;
    if (this.selectedPart) {
      (this.selectedPart.material as THREE.MeshStandardMaterial).color.set(
        color
      );
    }
  }

  onPartClick(part: THREE.Object3D): void {
    this.selectedPart = part as THREE.Mesh;
    this.focusOnPart(part);
  }

  focusOnPart(part: THREE.Object3D): void {
    if (this.currentOutline) {
      this.currentOutline.parent?.remove(this.currentOutline);
      this.currentOutline = null;
    }

    const box = new THREE.Box3().setFromObject(part);
    const center = box.getCenter(new THREE.Vector3());

    this.controls.target.copy(center);
    this.controls.update();

    this.highlightLight.position.copy(center);
    this.highlightLight.visible = true;

    this.currentOutline = this.addOutline(part);
  }

  addOutline(part: THREE.Object3D): THREE.Mesh {
    const outlineMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      side: THREE.BackSide,
    });
    const outlineMesh = new THREE.Mesh(
      (part as THREE.Mesh).geometry.clone(),
      outlineMaterial
    );
    outlineMesh.scale.multiplyScalar(1.05);
    part.add(outlineMesh);

    return outlineMesh;
  }

  resetCamera(): void {
    this.camera.position.set(0, 0, 100);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
    this.highlightLight.visible = false;
    this.resetModelTransform();
  }

  resetModelTransform(): void {
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = 0;
    this.positionX = 0;
    this.positionY = 0;
    this.positionZ = 0;
    this.updateTransform();
  }

  updateTransform(): void {
    if (this.model) {
      this.model.rotation.set(
        THREE.MathUtils.degToRad(this.rotationX),
        THREE.MathUtils.degToRad(this.rotationY),
        THREE.MathUtils.degToRad(this.rotationZ)
      );
      this.model.position.set(this.positionX, this.positionY, this.positionZ);
    }
  }

  saveDesign(): void {
    const partsData = this.parts.map((part) => {
      const material = (part as THREE.Mesh)
        .material as THREE.MeshStandardMaterial;
      return {
        nombre_parte: part.name,
        color: material.color.getStyle(), // Color en formato CSS
        modelo: this.listCartsDesing.id, // Relacionar con el modelo actual
        personalizacion: this.id, // Relacionar con la personalización actual si es necesario
        usuario: this.userId, // Ajusta este valor según el usuario
      };
    });

    this.PartsService.savePartes(partsData).subscribe(
      (response) => {
        this.saveDesingStatus = true;
        localStorage.setItem('saveDesingStatus', 'true'); // Guardar en localStorage
        console.log('Diseño guardado con éxito:', response);
      },
      (error) => {
        console.error('Error al guardar el diseño:', error);
      }
    );

    // this.personalizacionService.savePartes(partsData).subscribe(
    //   (response) => {
    //     console.log("Diseño guardado con éxito:", response);
    //   },
    //   (error) => {
    //     console.error("Error al guardar el diseño:", error);
    //   }
    // );
  }
}
