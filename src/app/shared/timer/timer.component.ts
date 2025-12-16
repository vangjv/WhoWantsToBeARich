import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimerState } from '../../models/timer.model';

/**
 * Timer Component for displaying countdown timers
 * T085: Create TimerComponent with MM:SS format
 * Phase 8: Phone a Friend Lifeline
 */
@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent {
  /**
   * Timer state to display
   */
  @Input() timer: TimerState | null = null;

  /**
   * Format seconds as MM:SS
   */
  public formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Get CSS class for timer state
   */
  public getTimerClass(): string {
    if (!this.timer) {
      return '';
    }

    if (this.timer.isExpired) {
      return 'expired';
    }

    if (this.timer.remainingSeconds <= 10) {
      return 'warning';
    }

    return 'normal';
  }
}
