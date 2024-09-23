import { Component } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { LoadingButtonComponent } from './shared/components/loading-button/loading-button.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingButtonComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  isLoading = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationStart) // Solo si es el inicio de una navegación
      )
      .subscribe(() => {
        this.isLoading = true; // Muestra el loader al iniciar la navegación
      });

    this.router.events.subscribe((event) => {
      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.isLoading = false; // Oculta el loader al finalizar la navegación
      }
    });
  }
}
