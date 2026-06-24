import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { ShopComponent } from './shop/shop';
import { DecorComponent } from './decor/decor';
import { GiftsComponent } from './gifts/gifts';
import { AdminComponent } from './admin/admin';
import { LoginComponent } from './login/login';
import { adminGuard } from './admin/admin.guard';

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
