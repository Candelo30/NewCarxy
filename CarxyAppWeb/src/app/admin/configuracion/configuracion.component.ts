import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Modelo3dService } from '../../core/services/modelo3d.service';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [HeaderComponent, RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.css',
})
export class ConfiguracionComponent implements OnInit {
  @ViewChild('rendererContainer', { static: true })
  rendererContainer!: ElementRef;

  modeloForm: FormGroup;
  selectedFile: File | null = null;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  model!: THREE.Group;
  controls!: OrbitControls; // Definición de OrbitControls
  loading: boolean = false; // Indicador de carga
  progress: number = 0; // Progreso de carga
  private highlightLight!: THREE.PointLight;
  isLoading: boolean = true;
  idUser: any;

  constructor(
    private UserData: UserService,
    private fb: FormBuilder,
    private modelo3DService: Modelo3dService // Servicio que debes haber creado
  ) {
    // Inicializamos el formulario0
    this.modeloForm = this.fb.group({
      nombre_modelo: ['', Validators.required],
      archivo_modelo: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  //

  // Método para cargar los datos del usuario
  private loadUserData(): void {
    this.UserData.loadAllResources().subscribe({
      next: (resources) => {
        const data = resources.userData; // Datos del usuario

        // Asignar los valores a las propiedades del componente
        this.idUser = data.id;

        this.isLoading = false; // Marcar como cargado
      },
      error: (err) => {
        console.error('Error al cargar los datos', err);
        this.isLoading = false; // Asegurarse de ocultar el cargador incluso si hay un error
      },
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if ((file && file.name.endsWith('.glb')) || file.name.endsWith('.gltf')) {
      this.selectedFile = file;
      this.modeloForm.patchValue({ archivo_modelo: file });
      this.modeloForm.get('archivo_modelo')?.updateValueAndValidity();

      const reader = new FileReader();
      reader.onload = (e: any) => {
        // Crear la escena cuando se carga el archivo
        this.createScene();

        // Llamar al método para renderizar el archivo
        this.loadModelFromBuffer(e.target.result);
      };
      reader.readAsArrayBuffer(file);
    } else {
      console.error('Solo se permiten archivos .glb o .gltf');
    }
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

  // Método para cargar el modelo a partir del ArrayBuffer
  private loadModelFromBuffer(arrayBuffer: ArrayBuffer): void {
    const loader = new GLTFLoader();
    const blob = new Blob([arrayBuffer], { type: 'model/gltf-binary' });
    const url = URL.createObjectURL(blob);

    loader.load(
      url,
      (gltf) => {
        this.model = gltf.scene;
        this.model.scale.set(0.1, 0.1, 0.1);
        this.model.position.set(0, 0, 0);
        this.scene.add(this.model);

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

  // Método que se llama al enviar el formulario
  onSubmit(): void {
    console.log('Id del usuario: ', this.idUser);
    if (this.modeloForm.valid && this.selectedFile) {
      const formData: FormData = new FormData();
      formData.append(
        'nombre_modelo',
        this.modeloForm.get('nombre_modelo')?.value
      );

      formData.append('usuario', this.idUser);
      formData.append('archivo_modelo', this.selectedFile);

      this.modelo3DService.createModelo(formData).subscribe(
        (response) => {
          console.log('Modelo subido exitosamente', response);
        },
        (error) => {
          console.error('Error al subir el modelo', error);
        }
      );
    }
  }
}
