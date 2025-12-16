import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GameStateService } from '../../services/game-state.service';
import { GamePhase } from '../../models/game-phase.model';
import { Subscription } from 'rxjs';

/**
 * Admin Panel Component
 * Contains Walk Away button and other admin controls
 * T061: Walk Away button with state management (disabled if answer locked)
 */
@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit, OnDestroy {
  private stateSubscription?: Subscription;

  /**
   * Whether walk away button should be disabled
   * Disabled when answer is locked or revealed
   */
  public walkAwayDisabled = false;

  /**
   * Current game phase for UI logic
   */
  public currentPhase: GamePhase = GamePhase.SETUP;

  constructor(private gameStateService: GameStateService) {}

  ngOnInit(): void {
    // Subscribe to game state changes
    this.stateSubscription = this.gameStateService.gameState$.subscribe(state => {
      this.currentPhase = state.phase;

      // T063: Disable walk away button if answer locked or game ended
      this.walkAwayDisabled =
        state.phase === GamePhase.FINAL_LOCKED ||
        state.phase === GamePhase.REVEAL ||
        state.phase === GamePhase.ENDED ||
        state.phase === GamePhase.SETUP;
    });
  }

  ngOnDestroy(): void {
    this.stateSubscription?.unsubscribe();
  }

  /**
   * T062: Trigger walk away - contestant keeps last cleared level winnings
   */
  public onWalkAway(): void {
    if (!this.walkAwayDisabled) {
      this.gameStateService.walkAway();
    }
  }
}
