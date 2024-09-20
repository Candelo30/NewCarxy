import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UsuariosComponent } from './usuarios/usuarios.component';

const routes: Routes = [
  { path: '', component: AdminDashboardComponent }, // Cambié 'das' a 'dashboard'
  { path: 'dashboard', component: AdminDashboardComponent }, // Cambié 'das' a 'dashboard'
  { path: 'usuarios', component: UsuariosComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
