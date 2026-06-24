import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-wrapper container animate-fade-in">
      <div class="auth-card card glass-card">
        
        <div class="auth-header text-center">
          <span class="logo-icon">🌿</span>
          <h2>{{ isRegisterMode() ? 'Create GreenSpace Account' : 'Welcome Back' }}</h2>
          <p class="subtitle">{{ isRegisterMode() ? 'Sign up to purchase plants & save layouts' : 'Log in to manage orders & planner settings' }}</p>
        </div>

        <!-- Auth Error Banner -->
        <div *ngIf="errorMessage()" class="alert-banner">
          ⚠️ {{ errorMessage() }}
        </div>

        <!-- FORM -->
        <form (submit)="onSubmit()" class="auth-form">
          <div *ngIf="isRegisterMode()" class="form-group animate-fade-in">
            <label class="form-label">Full Name</label>
            <input type="text" [(ngModel)]="fullName" name="fullName" required placeholder="John Doe" class="form-input">
          </div>

          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" [(ngModel)]="email" name="email" required placeholder="name@domain.com" class="form-input">
          </div>

          <div *ngIf="isRegisterMode()" class="form-group animate-fade-in">
            <label class="form-label">Phone Number (Optional)</label>
            <input type="tel" [(ngModel)]="phone" name="phone" placeholder="9999999999" class="form-input">
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" [(ngModel)]="password" name="password" required placeholder="••••••••" class="form-input">
          </div>

          <button type="submit" class="btn btn-primary w-100 submit-btn" [disabled]="submitting()">
            {{ submitting() ? 'Please wait...' : (isRegisterMode() ? 'Register Account' : 'Log In') }}
          </button>
        </form>

        <div class="auth-footer text-center">
          <p>
            {{ isRegisterMode() ? 'Already have an account?' : "Don't have an account?" }}
            <a (click)="toggleMode()" class="toggle-link">
              {{ isRegisterMode() ? 'Log In here' : 'Sign Up here' }}
            </a>
          </p>
        </div>

        <!-- Dev Sandbox Seeding Credentials Helper -->
        <div class="dev-credentials-helper">
          <h4>🧪 Sandbox Testing Accounts:</h4>
          <div class="cred-row">
            <span><strong>Admin:</strong> admin&#64;greenspace.com</span>
            <span>Password: <code>AdminPassword123</code></span>
          </div>
          <div class="cred-row">
            <span><strong>Customer:</strong> user&#64;greenspace.com</span>
            <span>Password: <code>UserPassword123</code></span>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 200px);
      padding: 3rem 1rem;
    }
    .auth-card {
      width: 100%;
      max-width: 480px;
      padding: 3rem 2rem;
    }
    .auth-header {
      margin-bottom: 2rem;
    }
    .logo-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 0.5rem;
    }
    .auth-header h2 {
      color: var(--primary-color);
      font-size: 1.8rem;
    }
    .subtitle {
      color: #64748b;
      font-size: 0.9rem;
    }
    
    .alert-banner {
      background-color: #fee2e2;
      color: var(--danger-color);
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      margin-bottom: 1.5rem;
      font-size: 0.85rem;
      font-weight: 500;
    }
    
    .submit-btn {
      margin-top: 1.5rem;
    }
    .w-100 { width: 100%; }
    
    .auth-footer {
      margin-top: 1.5rem;
      font-size: 0.9rem;
      color: #64748b;
    }
    .toggle-link {
      color: var(--primary-color);
      font-weight: 600;
      cursor: pointer;
      text-decoration: underline;
    }
    
    /* Sandbox tools */
    .dev-credentials-helper {
      margin-top: 2.5rem;
      background-color: var(--light-bg);
      border: 1px dashed var(--border-color);
      border-radius: 8px;
      padding: 1rem;
      font-size: 0.8rem;
      color: #475569;
    }
    .dev-credentials-helper h4 {
      margin-bottom: 0.5rem;
      color: var(--primary-color);
      font-size: 0.85rem;
    }
    .cred-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.25rem;
    }
    .cred-row code {
      background-color: #e2e8f0;
      padding: 0.1rem 0.3rem;
      border-radius: 4px;
      font-family: monospace;
    }
  `]
})
export class LoginComponent implements OnInit {
  public isRegisterMode = signal(false);
  public submitting = signal(false);
  public errorMessage = signal<string | null>(null);

  // Form Fields
  public email = '';
  public password = '';
  public fullName = '';
  public phone = '';

  private returnUrl = '/home';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/home';
    });
  }

  toggleMode() {
    this.isRegisterMode.set(!this.isRegisterMode());
    this.errorMessage.set(null);
  }

  onSubmit() {
    if (!this.email || !this.password) return;
    this.submitting.set(true);
    this.errorMessage.set(null);

    if (this.isRegisterMode()) {
      if (!this.fullName) {
        this.errorMessage.set('Full name is required.');
        this.submitting.set(false);
        return;
      }
      this.authService.register({
        email: this.email,
        password: this.password,
        fullName: this.fullName,
        phone: this.phone || undefined
      }).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err)
      });
    } else {
      this.authService.login({
        email: this.email,
        password: this.password
      }).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleSuccess() {
    this.submitting.set(false);
    this.router.navigateByUrl(this.returnUrl);
  }

  private handleError(err: any) {
    this.submitting.set(false);
    this.errorMessage.set(err.error || 'Authentication failed. Please verify credentials.');
  }
}
