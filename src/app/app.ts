import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { DataService } from './data.service';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  public menuItems;
  public cartCount;
  
  public isLoggedIn;
  public isAdmin;
  public currentUser;

  constructor(private dataService: DataService, private authService: AuthService) {
    this.menuItems = this.dataService.menuItems;
    this.cartCount = this.dataService.cartCount;
    this.isLoggedIn = this.authService.isLoggedIn;
    this.isAdmin = this.authService.isAdmin;
    this.currentUser = this.authService.currentUser;
  }

  logout() {
    this.authService.logout();
  }
}
