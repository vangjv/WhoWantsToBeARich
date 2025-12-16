import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoneyLadder } from '../../models/money-ladder.model';
import { trigger, state, style, transition, animate } from '@angular/animations';

/**
 * Seat Ladder Component
 * Vertical dramatic styling for 1080p/4K display
 * Shows all 15 levels with current level highlighted and safe havens indicated
 */
@Component({
  selector: 'app-seat-ladder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-ladder.component.html',
  styleUrls: ['./seat-ladder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('levelHighlight', [
      state('inactive', style({ transform: 'scale(1)', opacity: 0.6 })),
      state('current', style({ transform: 'scale(1.1)', opacity: 1 })),
      state('cleared', style({ transform: 'scale(1)', opacity: 0.8 })),
      transition('* => current', [
        animate('400ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ])
    ])
  ]
})
export class SeatLadderComponent {
  @Input() ladder: MoneyLadder | null = null;
  @Input() currentLevel: number = 1;
  @Input() clearedLevel: number = 0;

  /**
   * Get the display state for a level
   */
  getLevelState(level: number): 'inactive' | 'current' | 'cleared' {
    if (level === this.currentLevel) {
      return 'current';
    }
    if (level <= this.clearedLevel) {
      return 'cleared';
    }
    return 'inactive';
  }

  /**
   * Check if a level is a safe haven
   */
  isSafeHaven(level: number): boolean {
    return this.ladder?.safeHavens.includes(level) || false;
  }

  /**
   * Format currency value for display
   */
  formatValue(value: number): string {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  }

  /**
   * Track levels by number for ngFor performance
   */
  trackByLevel(index: number, level: any): number {
    return level.levelNumber;
  }
}
