import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LifelineState, AudiencePercentages } from '../../models/lifeline.model';
import { ChoiceKey } from '../../models/choice-key.model';
import { TimerComponent } from '../../shared/timer/timer.component';
import { TimerState } from '../../models/timer.model';

/**
 * Lifeline Status Component
 * Shows 3 lifeline icons with availability status
 * Displays lifeline results (50:50 removed choices, audience percentages, friend suggestion)
 */
@Component({
  selector: 'app-lifeline-status',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, TimerComponent],
  templateUrl: './lifeline-status.component.html',
  styleUrls: ['./lifeline-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LifelineStatusComponent {
  @Input() lifelines: LifelineState | null = null;

  /**
   * Get lifeline display label
   */
  getLifelineLabel(type: 'fiftyFifty' | 'askAudience' | 'phoneFriend'): string {
    const labels = {
      fiftyFifty: '50:50',
      askAudience: 'Ask the Audience',
      phoneFriend: 'Phone a Friend'
    };
    return labels[type];
  }

  /**
   * Get lifeline icon
   */
  getLifelineIcon(type: 'fiftyFifty' | 'askAudience' | 'phoneFriend'): string {
    const icons = {
      fiftyFifty: '✂️',
      askAudience: '👥',
      phoneFriend: '📞'
    };
    return icons[type];
  }

  /**
   * Check if lifeline is used
   */
  isUsed(type: 'fiftyFifty' | 'askAudience' | 'phoneFriend'): boolean {
    return this.lifelines?.[type]?.used || false;
  }

  /**
   * Get audience percentages for display
   */
  getAudiencePercentages(): { key: ChoiceKey; percentage: number }[] | null {
    const percentages = this.lifelines?.askAudience?.percentages;
    if (!percentages) return null;

    return [
      { key: 'A' as ChoiceKey, percentage: percentages.A },
      { key: 'B' as ChoiceKey, percentage: percentages.B },
      { key: 'C' as ChoiceKey, percentage: percentages.C },
      { key: 'D' as ChoiceKey, percentage: percentages.D }
    ].filter(item => item.percentage > 0); // Hide removed choices (0%)
  }

  /**
   * Get friend suggestion text
   */
  getFriendSuggestion(): string | null {
    return this.lifelines?.phoneFriend?.suggestion || null;
  }

  /**
   * Get Phone a Friend timer state
   */
  getPhoneFriendTimer(): TimerState | null {
    return this.lifelines?.phoneFriend?.timer || null;
  }

  /**
   * Track audience items by key
   */
  trackByKey(index: number, item: any): string {
    return item.key;
  }
}
