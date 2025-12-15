import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

/**
 * Admin Panel Component - Placeholder for Phase 5
 * Will contain Walk Away button and other admin controls
 */
@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card class="admin-card">
      <mat-card-header>
        <mat-card-title>Admin Controls</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p style="color: rgba(255,255,255,0.6); text-align: center;">
          Walk Away and other controls<br>coming in Phase 5
        </p>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .admin-card {
      background: #16213e;
      color: #ffffff;
      height: 100%;
    }
  `]
})
export class AdminPanelComponent {}
