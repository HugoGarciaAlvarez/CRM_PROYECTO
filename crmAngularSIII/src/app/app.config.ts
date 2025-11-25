import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { AppModule } from './app.module';

export const appConfig: ApplicationConfig = {
  providers: [
    // Importa los providers declarados en AppModule (incluye FormsModule / RouterModule)
    importProvidersFrom(AppModule)
  ]
};
