import { Routes } from '@angular/router';
import { UnsavedChangesGuard } from './guards/unsaved-changes.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/host',
    pathMatch: 'full'
  },
  {
    path: 'host',
    loadComponent: () => import('./host/host-layout/host-layout.component').then(m => m.HostLayoutComponent),
    canDeactivate: [UnsavedChangesGuard]
  },
  {
    path: 'seat',
    loadComponent: () => import('./seat/seat-layout/seat-layout.component').then(m => m.SeatLayoutComponent)
  }
];
