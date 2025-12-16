import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GameStateService } from '../../services/game-state.service';
import { GamePhase } from '../../models/game-phase.model';
import { Subscription } from 'rxjs';

/**
 * Lifeline Control Component
 * T067: 50:50 lifeline button with state management
 * Phase 6: 50:50 Lifeline implementation
 */
@Component({
  selector: 'app-lifeline-control',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './lifeline-control.component.html',
  styleUrls: ['./lifeline-control.component.scss']
})
export class LifelineControlComponent implements OnInit, OnDestroy {
  private stateSubscription?: Subscription;

  /**
   * Lifeline availability states
   */
  public fiftyFiftyUsed = false;
  public askAudienceUsed = false;
  public phoneFriendUsed = false;

  /**
   * Whether lifelines should be disabled (answer locked or no question)
   */
  public lifelinesDisabled = true;

  /**
   * Current game phase
   */
  public currentPhase: GamePhase = GamePhase.SETUP;

  constructor(private gameStateService: GameStateService) {}

  ngOnInit(): void {
    // Subscribe to game state changes
    this.stateSubscription = this.gameStateService.gameState$.subscribe(state => {
      this.currentPhase = state.phase;

      // Update lifeline used states
      this.fiftyFiftyUsed = state.lifelines.fiftyFifty.used;
      this.askAudienceUsed = state.lifelines.askAudience.used;
      this.phoneFriendUsed = state.lifelines.phoneFriend.used;

      // T072: Disable lifelines if answer locked or no question
      this.lifelinesDisabled =
        state.phase === GamePhase.FINAL_LOCKED ||
        state.phase === GamePhase.REVEAL ||
        state.phase === GamePhase.ENDED ||
        state.phase === GamePhase.SETUP ||
        state.currentQuestion === null;
    });
  }

  ngOnDestroy(): void {
    this.stateSubscription?.unsubscribe();
  }

  /**
   * T068: Trigger 50:50 lifeline
   */
  public onUseFiftyFifty(): void {
    if (!this.fiftyFiftyUsed && !this.lifelinesDisabled) {
      this.gameStateService.useFiftyFifty();
    }
  }

  /**
   * Check if 50:50 button should be disabled
   */
  public isFiftyFiftyDisabled(): boolean {
    return this.fiftyFiftyUsed || this.lifelinesDisabled;
  }

  /**
   * Get tooltip text for 50:50 button
   */
  public getFiftyFiftyTooltip(): string {
    if (this.fiftyFiftyUsed) {
      return '50:50 has already been used';
    }
    if (this.lifelinesDisabled) {
      if (this.currentPhase === GamePhase.SETUP) {
        return 'Start a question to use lifelines';
      }
      if (this.currentPhase === GamePhase.FINAL_LOCKED || this.currentPhase === GamePhase.REVEAL) {
        return 'Cannot use lifelines after locking answer';
      }
      return 'Lifelines not available';
    }
    return 'Remove two incorrect answers';
  }
}
