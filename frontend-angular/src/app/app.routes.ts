import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { HomePageComponent } from './pages/home-page.component';
import { AppShellComponent } from './pages/app-shell.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'login', component: HomePageComponent },
  { path: 'register', component: HomePageComponent },
  {
    path: ':role/:section',
    canActivate: [authGuard],
    component: AppShellComponent
  },
  { path: '**', redirectTo: '' }
];
