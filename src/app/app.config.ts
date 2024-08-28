import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideAnimations } from '@angular/platform-browser/animations';
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(), provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), 
    provideClientHydration(),
    provideToastr({
      closeButton: true,
      positionClass: 'toast-top-right',
      timeOut: 2000,
      preventDuplicates: true,
      progressBar: true,
      progressAnimation: 'increasing',
      toastClass: 'ngx-toastr toast-custom'
    }),
    provideAnimationsAsync(),
    provideAnimations()
  ]
};
