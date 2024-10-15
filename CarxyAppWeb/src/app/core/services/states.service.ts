import { Injectable, Renderer2, RendererFactory2, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatesService {
  private blueToPurple: string[] = [
    '#A230F7',
    '#686DFD',
    '#01E9F5',
    '#94F8CC',
    '#F35BD6',
  ];

  private colorSubject: BehaviorSubject<string>;
  private themeSubject: BehaviorSubject<string>;
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2, private ngZone: NgZone) {
    this.renderer = rendererFactory.createRenderer(null, null);

    const randomIndex = Math.floor(Math.random() * this.blueToPurple.length);
    const randomColor = this.blueToPurple[randomIndex];
    this.colorSubject = new BehaviorSubject<string>(randomColor);

    // Protección del acceso a localStorage y window
    const initialTheme = this.getFromLocalStorage('theme') || 'system';
    this.themeSubject = new BehaviorSubject<string>(initialTheme);

    // Solo aplica el tema y escucha cambios si estamos en el navegador
    if (this.isBrowser()) {
      this.applyTheme();
      this.listenToSystemThemeChanges();
    }
  }

  // Verifica si estamos en el entorno del navegador
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // Función segura para leer de localStorage
  private getFromLocalStorage(key: string): string | null {
    return this.isBrowser() ? localStorage.getItem(key) : null;
  }

  // Método para obtener el color actual (observable)
  getColor() {
    return this.colorSubject.asObservable();
  }

  // Método para obtener el tema actual (observable)
  getTheme() {
    return this.themeSubject.asObservable();
  }

  // Aplica el tema basado en la preferencia guardada o del sistema
  applyTheme() {
    if (this.isBrowser()) {
      const savedTheme = this.themeSubject.getValue();
      const systemPrefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;

      const isDarkMode =
        savedTheme === 'dark' || (savedTheme === 'system' && systemPrefersDark);

      this.ngZone.run(() => {
        if (isDarkMode) {
          this.renderer.addClass(document.documentElement, 'dark');
        } else {
          this.renderer.removeClass(document.documentElement, 'dark');
        }
      });
    }
  }

  // Escucha los cambios de tema del sistema en tiempo real
  listenToSystemThemeChanges(): void {
    if (this.isBrowser()) {
      const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

      const systemThemeChangeListener = (event: MediaQueryListEvent) => {
        console.log(
          'Cambio detectado en las preferencias del sistema:',
          event.matches
        );

        // Solo aplica el tema automáticamente si la preferencia es 'system'
        if (this.themeSubject.getValue() === 'system') {
          this.applyTheme();
        }
      };

      // Escucha cambios en navegadores modernos y antiguos
      if (mediaQueryList.addEventListener) {
        mediaQueryList.addEventListener('change', systemThemeChangeListener);
      } else {
        mediaQueryList.addListener(systemThemeChangeListener);
      }
    }
  }

  // Cambia el tema y lo guarda en localStorage
  setTheme(theme: string) {
    if (this.isBrowser()) {
      localStorage.setItem('theme', theme);
    }
    this.themeSubject.next(theme); // Actualiza el BehaviorSubject
    this.applyTheme(); // Aplica el nuevo tema inmediatamente
  }
}
