import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface UserSession {
  token: string;
  email: string;
  fullName: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authUrl = 'http://localhost:5144/api/auth';

  // Active user session signal
  public currentUser = signal<UserSession | null>(null);

  // Computed state helper signals
  public isLoggedIn = computed(() => this.currentUser() !== null);
  public isAdmin = computed(() => this.currentUser()?.role === 'Admin');

  constructor(private http: HttpClient, private router: Router) {
    // Load session on startup if present
    const token = localStorage.getItem('gs_token');
    const email = localStorage.getItem('gs_email');
    const fullName = localStorage.getItem('gs_fullname');
    const role = localStorage.getItem('gs_role');

    if (token && email && fullName && role) {
      this.currentUser.set({ token, email, fullName, role });
    }
  }

  public login(credentials: { email: string; password: string }): Observable<UserSession> {
    return this.http.post<UserSession>(`${this.authUrl}/login`, credentials).pipe(
      tap(session => this.setSession(session))
    );
  }

  public register(payload: { email: string; password: string; fullName: string; phone?: string }): Observable<UserSession> {
    return this.http.post<UserSession>(`${this.authUrl}/register`, payload).pipe(
      tap(session => this.setSession(session))
    );
  }

  public logout() {
    localStorage.removeItem('gs_token');
    localStorage.removeItem('gs_email');
    localStorage.removeItem('gs_fullname');
    localStorage.removeItem('gs_role');
    
    this.currentUser.set(null);
    this.router.navigate(['/home']);
  }

  private setSession(session: UserSession) {
    localStorage.setItem('gs_token', session.token);
    localStorage.setItem('gs_email', session.email);
    localStorage.setItem('gs_fullname', session.fullName);
    localStorage.setItem('gs_role', session.role);
    
    this.currentUser.set(session);
  }
}
