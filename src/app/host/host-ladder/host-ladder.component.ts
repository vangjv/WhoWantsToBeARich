import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GameStateService } from '../../services/game-state.service';
import { GameState } from '../../models/game-state.model';
import { LadderLevel } from '../../models/money-ladder.model';

/**
 * Host Ladder Component
 * Purpose: Display money ladder for host view
 * Features:
 * - Show all 15 levels
 * - Highlight current level
 * - Mark cleared levels
 * - Indicate safe haven positions
 */
@Component({
  selector: 'app-host-ladder',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './host-ladder.component.html',
  styleUrls: ['./host-ladder.component.scss']
})
export class HostLadderComponent implements OnInit, OnDestroy {
  gameState: GameState | null = null;

  private destroy$ = new Subject<void>();

  constructor(private gameStateService: GameStateService) {}

  ngOnInit(): void {
    this.gameStateService.gameState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.gameState = state;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isSafeHaven(level: number): boolean {
    return this.gameState?.ladder.safeHavens.includes(level) || false;
  }

  isCurrentLevel(level: number): boolean {
    return this.gameState?.currentLevel === level;
  }

  isCleared(level: number): boolean {
    return level <= (this.gameState?.clearedLevel || 0);
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

  getLadderLevels(): LadderLevel[] {
    if (!this.gameState?.ladder.levels) {
      return [];
    }
    // Return in reverse order (15 to 1) for display
    return [...this.gameState.ladder.levels].reverse();
  }
}
