import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { HomeComponent } from './shared/components/home/home.component';
import { AuthGuard } from './auth/auth.guard';
import { ProfileComponent } from './shared/components/profile/profile.component';
import { NoAuthGuard } from './auth/no-auth.guard';

export const routes: Routes = [
  { path: 'login', canActivate: [NoAuthGuard], component: LoginComponent }, // Ruta para el inicio de sesión
  {
    path: 'register',
    canActivate: [NoAuthGuard],
    component: RegisterComponent,
  }, // Ruta para el registro
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] }, // Ruta para el inicio de sesión
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] }, // Ruta para el inicio de sesión
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // Ruta predeterminada redirige a login
  { path: '**', redirectTo: 'home' }, // En caso de rutas no encontradas, redirige al login
];
