import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: any;

  constructor(private http: HttpClient) {}

  async loadConfig(): Promise<void> {
    try {
      this.config = await firstValueFrom(this.http.get('/assets/web.config')
        .pipe(
          catchError((error: any) => {
            console.error('Error loading config:', error);
            return throwError(() => new Error(error));
          })
        )
      );
      console.log('Config loaded:', this.config); // Debugging
    } catch (error) {
      console.error('Failed to load config', error);
      
    }
  }

  
  getConfig() {
    return this.config;
  }
  getClientId(): string {
    return this.config?.clientId;
  }

  getSecretKey(): string {
    return this.config?.secretKey;
  }

  getApiUrl(): string {
    return this.config?.apiUrl;
  }
}
