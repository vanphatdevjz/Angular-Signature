import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HashService } from './hash.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
   // Sử dụng proxy
   private apiUrl = `${environment.apiUrl}/Document/lookup-pdf`;
  constructor(private http: HttpClient, private hashService: HashService) { }
  
  getPdf(documentCode: string, email: string, otp: string): Observable<ArrayBuffer> {
    const signature = this.hashService.generatePdfHash(documentCode, email, otp);
    console.log('Generated Signature:', signature); // Debugging
    const headers = new HttpHeaders({ 'Content-Type': 'application/json'  }); // responseType : 'arraybuffer'
    const body = { 
      documentCode: documentCode,
      email: email,
      otp: otp,
      clientId: environment.clientId, 
      signature: signature 
    };

    return this.http.post<ArrayBuffer>(this.apiUrl, body, { headers: headers, responseType: 'arraybuffer' as 'json' });
  }
}
