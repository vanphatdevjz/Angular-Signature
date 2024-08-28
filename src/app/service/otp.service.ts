import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HashService } from './hash.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class OtpService {
  private apiUrl: string;
  private clientId: string;

  constructor(
    private http: HttpClient,
    private hashService: HashService,
    private configService: ConfigService
  ) {
    this.apiUrl = `${this.configService.getApiUrl()}/Document/generate-otp-lookup`;
    this.clientId = this.configService.getClientId();

    // Debugging
    console.log('API URL in OtpService:', this.apiUrl);
  }

  sendOtp(email: string, documentCode: string): Observable<any> {
    const signature = this.hashService.generateOtpHash(documentCode, email);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      email: email,
      documentCode: documentCode,
      clientId: this.clientId,
      signature: signature
    };

    console.log('Sending request to:', this.apiUrl);
    console.log('Request body:', body);

    return this.http.post<any>(this.apiUrl, body, { headers: headers });
  }
}