import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { ConfigService } from './app/service/config.service';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

async function initializeApp(configService: ConfigService) {
  await configService.loadConfig();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    
    provideToastr(),
    importProvidersFrom(RouterModule.forRoot([])), // Cung cấp RouterModule với cấu hình route nếu có
    importProvidersFrom(BrowserAnimationsModule),
    ConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: (configService: ConfigService) => () => initializeApp(configService),
      deps: [ConfigService],
      multi: true
    },
    
   
  ]
}).catch(err => console.error(err));
