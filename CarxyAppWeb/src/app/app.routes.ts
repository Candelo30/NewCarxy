import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { HomeComponent } from './shared/components/home/home.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent }, // Ruta para el inicio de sesión
  { path: 'register', component: RegisterComponent }, // Ruta para el registro
  { path: 'home', component: HomeComponent }, // Ruta para el inicio de sesión
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // Ruta predeterminada redirige a login
  { path: '**', redirectTo: 'home' }, // En caso de rutas no encontradas, redirige al login
];
