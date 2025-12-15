import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { GameState } from '../../models/game-state.model';

/**
 * Game End Summary Component
 * Purpose: Display final game results (FR-010)
 * Features:
 * - Final winnings amount
 * - Questions cleared count
 * - Lifelines used count
 * - Highest safe haven reached
 */
@Component({
  selector: 'app-game-end-summary',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './game-end-summary.component.html',
  styleUrls: ['./game-end-summary.component.scss']
})
export class GameEndSummaryComponent {
  @Input() gameState: GameState | null = null;

  getLifelinesUsedCount(): number {
    if (!this.gameState) return 0;

    let count = 0;
    if (this.gameState.lifelines.fiftyFifty.used) count++;
    if (this.gameState.lifelines.askAudience.used) count++;
    if (this.gameState.lifelines.phoneFriend.used) count++;

    return count;
  }

  getHighestSafeHaven(): number {
    if (!this.gameState) return 0;

    const safeHavens = this.gameState.ladder.safeHavens
      .filter(sh => sh <= this.gameState!.clearedLevel)
      .sort((a, b) => b - a);

    return safeHavens.length > 0 ? safeHavens[0] : 0;
  }

  getSafeHavenValue(): number {
    const safeHaven = this.getHighestSafeHaven();
    if (safeHaven === 0) return 0;

    const level = this.gameState?.ladder.levels.find(l => l.levelNumber === safeHaven);
    return level?.value || 0;
  }

  formatValue(value: number): string {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
    } else {
      return `$${value}`;
    }
  }

  getGameEndMessage(): string {
    if (!this.gameState) return '';

    if (this.gameState.walkAway) {
      return `${this.gameState.contestantName} walked away!`;
    } else if (this.gameState.finalWinnings === 1000000) {
      return `🎉 ${this.gameState.contestantName} won the million! 🎉`;
    } else if (this.gameState.clearedLevel === 15) {
      return `Congratulations ${this.gameState.contestantName}!`;
    } else {
      return `Game Over - ${this.gameState.contestantName}`;
    }
  }
}
