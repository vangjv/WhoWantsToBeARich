import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/host',
    pathMatch: 'full'
  },
  {
    path: 'host',
    loadComponent: () => import('./host/host-layout/host-layout.component').then(m => m.HostLayoutComponent)
  },
  {
    path: 'seat',
    loadComponent: () => import('./seat/seat-layout/seat-layout.component').then(m => m.SeatLayoutComponent)
  }
];
