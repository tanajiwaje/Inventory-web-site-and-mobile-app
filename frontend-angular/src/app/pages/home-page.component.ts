import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { notify } from '../core/notify';
import { AuthApiService } from '../core/services/auth-api.service';
import { PublicApiService } from '../core/services/public-api.service';
import { CompanySettings } from '../core/types';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="bg-light">
    <header class="border-bottom bg-white">
      <div class="container py-3 d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-3">
          <img *ngIf="company?.logoUrl; else noLogo" [src]="company?.logoUrl" alt="Company logo" style="width:48px;height:48px" />
          <ng-template #noLogo><div class="logo-mark">I</div></ng-template>
          <div>
            <strong class="d-block">{{ company?.name || 'Inventory Control' }}</strong>
            <small class="text-muted">{{ company?.tagline || 'Operate faster with clear stock visibility.' }}</small>
          </div>
        </div>
      </div>
    </header>

    <main class="container py-5">
      <div class="row g-4 align-items-center">
        <div class="col-12 col-lg-6">
          <h1 class="display-6 fw-semibold mb-3">{{ company?.tagline || 'Inventory, purchasing, and sales in one place.' }}</h1>
          <p class="text-muted">{{ company?.description || 'Centralize inventory, suppliers, and customer orders.' }}</p>
        </div>
        <div class="col-12 col-lg-6">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="btn-group w-100 mb-3">
                <button type="button" class="btn" [class.btn-primary]="tab==='login'" [class.btn-outline-primary]="tab!=='login'" (click)="tab='login'">Login</button>
                <button type="button" class="btn" [class.btn-primary]="tab==='register'" [class.btn-outline-primary]="tab!=='register'" (click)="tab='register'">Register</button>
              </div>
              <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

              <form *ngIf="tab==='login'" (ngSubmit)="handleLogin()">
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input class="form-control" type="email" [(ngModel)]="loginEmail" name="loginEmail" required />
                </div>
                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <input class="form-control" type="password" [(ngModel)]="loginPassword" name="loginPassword" required />
                </div>
                <button class="btn btn-primary w-100" type="submit">Login</button>
              </form>

              <form *ngIf="tab==='register'" (ngSubmit)="handleRegister()">
                <div class="mb-3">
                  <label class="form-label">Full Name</label>
                  <input class="form-control" [(ngModel)]="registerName" name="registerName" required />
                </div>
                <div class="mb-3">
                  <label class="form-label">Role</label>
                  <select class="form-select" [(ngModel)]="registerRole" name="registerRole">
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">Company Name</label>
                  <input class="form-control" [(ngModel)]="registerCompanyName" name="registerCompanyName" />
                </div>
                <div class="mb-3">
                  <label class="form-label">GST Number</label>
                  <input class="form-control" [(ngModel)]="registerGstNumber" name="registerGstNumber" />
                </div>
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input class="form-control" type="email" [(ngModel)]="registerEmail" name="registerEmail" required />
                </div>
                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <input class="form-control" type="password" [(ngModel)]="registerPassword" name="registerPassword" required />
                </div>
                <div class="mb-3">
                  <label class="form-label">Phone</label>
                  <input class="form-control" [(ngModel)]="registerPhone" name="registerPhone" />
                </div>
                <div class="mb-3">
                  <label class="form-label">Address</label>
                  <input class="form-control" [(ngModel)]="registerAddress" name="registerAddress" />
                </div>
                <button class="btn btn-primary w-100" type="submit">Register</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
  `
})
export class HomePageComponent implements OnInit {
  private auth = inject(AuthService);
  private authApi = inject(AuthApiService);
  private publicApi = inject(PublicApiService);
  private router = inject(Router);

  company: CompanySettings | null = null;
  tab: 'login' | 'register' = 'login';
  error = '';

  loginEmail = '';
  loginPassword = '';
  registerName = '';
  registerRole = 'buyer';
  registerEmail = '';
  registerPassword = '';
  registerPhone = '';
  registerAddress = '';
  registerCompanyName = '';
  registerGstNumber = '';

  ngOnInit() {
    const user = this.auth.user();
    const token = this.auth.token();
    if (token && user) {
      this.redirectByRole(user.role);
      return;
    }
    this.publicApi.getCompany().pipe(catchError(() => of(null))).subscribe((res) => (this.company = res));
  }

  handleLogin() {
    this.error = '';
    this.authApi.login(this.loginEmail, this.loginPassword).subscribe({
      next: (res) => {
        this.auth.login(res.token, res.user);
        notify('success', 'Login successful');
        this.redirectByRole(res.user.role);
      },
      error: (err) => (this.error = err?.error || err?.message || 'Login failed')
    });
  }

  handleRegister() {
    this.error = '';
    this.authApi
      .register({
        name: this.registerName,
        email: this.registerEmail,
        password: this.registerPassword,
        role: this.registerRole,
        phone: this.registerPhone || undefined,
        address: this.registerAddress || undefined,
        companyName: this.registerCompanyName || undefined,
        gstNumber: this.registerGstNumber || undefined
      })
      .subscribe({
        next: () => {
          notify('success', 'Registration submitted');
          this.tab = 'login';
        },
        error: (err) => (this.error = err?.error || err?.message || 'Registration failed')
      });
  }

  private redirectByRole(role: string) {
    const base = role === 'admin' || role === 'super_admin' ? 'admin' : role === 'seller' ? 'seller' : 'buyer';
    this.router.navigateByUrl(`/${base}/dashboard`);
  }
}
