import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { LoadingButtonComponent } from './shared/components/loading-button/loading-button.component';
import { filter, Subscription } from 'rxjs';
import { StatesService } from './core/services/states.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingButtonComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  currentTheme: string = 'light'; // Inicializa con un valor por defecto
  themeSubscription: Subscription = new Subscription(); // Inicializa como un nuevo Subscription
  isLoading = true;

  constructor(private router: Router, private statesService: StatesService) {
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

  ngOnInit(): void {
    this.themeSubscription = this.statesService
      .getTheme()
      .subscribe((theme) => {
        this.currentTheme = theme;
      });
  }

  ngOnDestroy(): void {
    // Desuscribirse del tema al destruir el componente
    this.themeSubscription.unsubscribe(); // Llama directamente a unsubscribe, no necesitas chequear si es null
  }
}
