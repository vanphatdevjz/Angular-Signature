import { Injectable } from '@angular/core';
import sha256 from 'crypto-js/sha256';
import { environment } from '../../environments/environment';
import { ConfigService } from './config.service';


@Injectable({
  providedIn: 'root'
})
export class HashService {
  private secretKey: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.getSecretKey();
    console.log('secretKey  in OtpService:', this.secretKey);
  }

  generateOtpHash(documentCode: string, email: string): string {
    const contentToHash = `${documentCode}|${email}|${this.secretKey}`;
    return sha256(contentToHash).toString().toUpperCase();
  }

  generatePdfHash(documentCode: string, email: string, otp: string): string {
    const contentToHash = `${documentCode}|${email}|${otp}|${this.secretKey}`;
    return sha256(contentToHash).toString().toUpperCase();
  }
}
