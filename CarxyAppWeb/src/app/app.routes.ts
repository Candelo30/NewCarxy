import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { HomeComponent } from './shared/components/home/home.component';
import { AuthGuard } from './auth/auth.guard';
import { ProfileComponent } from './shared/components/profile/profile.component';
import { NoAuthGuard } from './auth/no-auth.guard';
import { HelpComponent } from './shared/components/help/help.component';
import { AdminGuard } from './core/guard/admin.guard';
import { SettingsComponent } from './shared/components/settings/settings.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] }, // Ruta para el inicio de sesión
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [NoAuthGuard],
  }, // Ruta para el registro
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.module').then((m) => m.AdminModule),
    canActivate: [AuthGuard, AdminGuard], // Solo accesible para usuarios autenticados
  },
  {
    path: 'design',
    loadChildren: () =>
      import('./desings/desings.module').then((m) => m.DesingsModule),
    canActivate: [AuthGuard], // Solo accesible para usuarios autenticados
  },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] }, // Acceso restringido
  { path: 'help', component: HelpComponent, canActivate: [AuthGuard] }, // Acceso restringido
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] }, // Acceso restringido
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] }, // Acceso restringido
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Ruta predeterminada
  { path: '**', redirectTo: '/home' }, // En caso de rutas no encontradas
];
