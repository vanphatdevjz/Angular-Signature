import { Routes } from '@angular/router';
import { AppComponent } from './app.component';

export const routes: Routes = [
  { path: ':email/:documentCode/:otp', component: AppComponent },
  { path: '', component: AppComponent },
  //{ path: '**', redirectTo: '', pathMatch: 'full' } // Đảm bảo rằng bất kỳ URL nào không khớp đều chuyển hướng về trang chính
];