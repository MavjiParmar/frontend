import { Routes } from '@angular/router';
import { HomeComponent } from './home';
import { ShopComponent } from './shop';
import { DecorComponent } from './decor';
import { GiftsComponent } from './gifts';
import { AdminComponent } from './admin';
import { LoginComponent } from './login';
import { adminGuard } from './admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'shop/:category', component: ShopComponent },
  { path: 'decor-planner', component: DecorComponent },
  { path: 'gifts', component: GiftsComponent },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '/home' }
];
