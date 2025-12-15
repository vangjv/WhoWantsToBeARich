import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Seat Layout Component - Placeholder for Phase 4
 * Route: /seat
 * Purpose: Contestant/audience display (second screen)
 */
@Component({
  selector: 'app-seat-layout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="seat-placeholder">
      <h1>Contestant Display</h1>
      <p>Full implementation coming in Phase 4</p>
    </div>
  `,
  styles: [`
    .seat-placeholder {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #ffd700;
      font-family: 'Roboto', sans-serif;
      text-align: center;
    }

    h1 {
      font-size: 48px;
      margin-bottom: 24px;
      text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
    }

    p {
      font-size: 24px;
      color: rgba(255, 255, 255, 0.7);
    }
  `]
})
export class SeatLayoutComponent {}
