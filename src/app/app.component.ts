import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormControlName, FormGroup, Validators } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { OtpService } from './service/otp.service';
import { PdfService } from './service/pdf.service';
import { PdfJsViewerModule } from "ng2-pdfjs-viewer";
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import {Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ConfigService } from './service/config.service';
import { Title } from '@angular/platform-browser';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule, CommonModule,PdfJsViewerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  
  
})
export class AppComponent {
  title = 'Vsoft Signature';
  pdfData: string | undefined;
  checkF: FormGroup;
  


  constructor(private fb: FormBuilder, private otpService: OtpService, private pdfService: PdfService, private toastr: ToastrService, private route: ActivatedRoute, private router: Router,private configService: ConfigService,private titleService: Title) {
    
    this.checkF = this.fb.group({
      email: new FormControl('', [Validators.email, Validators.maxLength(64)]),
      documentCode: new FormControl('', [Validators.required,  Validators.maxLength(512)]),   //Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]+$'),
      otp: ['']
    });
  }

  async ngOnInit(): Promise<void> {
    
    await this.configService.loadConfig();
    const config = this.configService.getConfig();
    if (config) {
      const appTitle = config.title || 'Default Title';
      this.titleService.setTitle(appTitle);
      this.title = appTitle;
    } else {
      console.error('Config not loaded');
    }
    // Debugging values
    console.log('Client ID from ConfigService:', this.configService.getClientId());
    console.log('Secret Key from ConfigService:', this.configService.getSecretKey());
    console.log('ApiUrl from ConfigService:', this.configService.getApiUrl());
    // Binding URL query parameters to form controls
    this.route.queryParamMap.subscribe((params: ParamMap) => {
      let email = params.get('email') || '';
      let documentCode = params.get('documentCode') || '';
      let otp = params.get('otp') || '';

      email = email.replace(/"/g, '');
      documentCode = documentCode.replace(/"/g, '');
      otp = otp.replace(/"/g, '');

      // Debugging
      console.log('Email from URL:', email);
      console.log('Document Code from URL:', documentCode);
      console.log('OTP from URL:', otp);

      this.checkF.patchValue({ email, documentCode, otp });

      // Debugging
      console.log('Form Values after patching:', this.checkF.value);
    });
  }

  onSave() {
    if (this.checkF.valid) {
      const email = this.checkF.get('email')?.value;
      const documentCode = this.checkF.get('documentCode')?.value;
      const otp = this.checkF.get('otp')?.value;
      console.log('Email:', email); // Debugging
      console.log('Document Code:', documentCode); // Debugging
      console.log('OTP:', otp); // Debugging
      // Cập nhật URL với các tham số từ form
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { email, documentCode, otp },
        queryParamsHandling: 'merge', // Giữ lại các query params hiện tại
      });
      this.loadPdf(documentCode, email, otp);
      
    } else {
      this.toastr.warning('Form không hợp lệ. Vui lòng kiểm tra lại thông tin.');
    }
  }

  resendOtp() {
    const email = this.checkF.get('email')?.value;
    const documentCode = this.checkF.get('documentCode')?.value;
    if (email) {
      console.log('Sending OTP for email:', email);

      this.otpService.sendOtp(email, documentCode).subscribe({
        next: response => {
          console.log('Server response:', response); // Debugging

          if (response.isSuccess) {
            this.toastr.success('OTP đã được gửi lại qua email.', 'Thông báo!');
          } else {
            // Xử lý lỗi dựa trên mã lỗi từ server
            switch (response.message) {
              case 'Tài liệu công khai, không cần mã OTP! Xin vui lòng kiểm tra lại mã tài liệu.':
                this.toastr.warning(response.message, 'Cảnh báo!');
                break;
              case 'ClientId không hợp lệ.':
                this.toastr.error(response.message, 'Lỗi!');
                break;
              case 'Chữ ký không hợp lệ.':
                this.toastr.error(response.message, 'Lỗi!');
                break;
              case 'Tài liệu được bảo mật không thể tra cứu ở đây! Xin vui lòng kiểm tra lại mã tài liệu.':
                this.toastr.warning(response.message, 'Cảnh báo!');
                break;
              default:
                this.toastr.error('Có lỗi xảy ra khi gửi OTP. Vui lòng thử lại.', 'Lỗi!');
                break;
            }
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error response:', error);

          if (error.error && error.error.errors) {
            // Xử lý lỗi xác thực từ server
            const validationErrors = error.error.errors;
            const errorMessages = Object.values(validationErrors).flat();
            this.toastr.error(errorMessages.join(', '), 'Lỗi xác thực!');
          } else {
            // Xử lý các lỗi khác
            this.toastr.error('Có lỗi xảy ra khi gửi OTP. Vui lòng thử lại.', 'Lỗi!');
          }
        },
        complete: () => {
          // Thực hiện khi quá trình gửi hoàn tất, nếu cần
        }
      });
    } else {
      this.toastr.warning('Vui lòng điền mã tra cứu.', 'Thông báo!');
      this.toastr.warning('Vui lòng điền email.', 'Thông báo!');
    }
  }
  loadPdf(documentCode: string, email: string, otp: string) {
    this.pdfService.getPdf(documentCode, email, otp).subscribe({
      next: (data: ArrayBuffer) => {
        console.log('PDF Data:', data); // Debugging
        const blob = new Blob([data], { type: 'application/pdf' });
        this.pdfData = URL.createObjectURL(blob);
        console.log(this.pdfData);
      },
      error: (error: any) => {
        console.error('Error fetching PDF:', error);
        this.toastr.error('Vui lòng nhập thử lại OTP hoặc OTP hết hạn.', 'Lỗi!');
      },
      complete: () => {
        this.toastr.success('PDF được tải lên thành công.', 'Thông báo!');
        console.log('PDF fetching completed.');
      }
    });
  }

  
}
