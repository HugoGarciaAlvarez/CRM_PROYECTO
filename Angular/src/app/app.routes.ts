import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { ClientesComponent } from './clientes/clientes.component';
import { ContactosComponent } from './contactos/contactos.component';
import { OportunidadesComponent } from './oportunidades/oportunidades.component';
import { ActividadesComponent } from './actividades/actividades.component';


export const routes: Routes = [
     { path: '', redirectTo: '/inicio', pathMatch: 'full' },
     { path: 'inicio', component: InicioComponent
      },
      {path: 'clientes', component: ClientesComponent},
      {path: 'contactos', component: ContactosComponent},
      {path: 'oportunidades', component: OportunidadesComponent},
      {path: 'tareas', component: ActividadesComponent}
      
      
];
