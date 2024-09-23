import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PanelDesingComponent } from './panel-desing/panel-desing.component';
import { ViewCarsComponent } from './view-cars/view-cars.component';

const routes: Routes = [
  { path: '', component: PanelDesingComponent },
  { path: 'panel', component: PanelDesingComponent },
  { path: 'cars-view/:id', component: ViewCarsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DesingsRoutingModule {}
