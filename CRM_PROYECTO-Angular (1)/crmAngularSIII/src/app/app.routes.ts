import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { ClientesComponent } from './clientes/clientes.component';

export const routes: Routes = [
     { path: '', redirectTo: '/inicio', pathMatch: 'full' },
     { path: 'inicio', component: InicioComponent
      },
      {path: 'clientes', component: ClientesComponent}
      
      
];
