import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
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
        error: (err: any) => this.handleError(err)
      });
    } else {
      this.authService.login({
        email: this.email,
        password: this.password
      }).subscribe({
        next: () => this.handleSuccess(),
        error: (err: any) => this.handleError(err)
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
