import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GameStateService } from '../../services/game-state.service';
import { GamePhase } from '../../models/game-phase.model';
import { WalkAwayConfirmationDialogComponent } from '../walk-away-confirmation-dialog/walk-away-confirmation-dialog.component';
import { Subscription } from 'rxjs';

/**
 * Admin Panel Component
 * Contains Walk Away button and other admin controls
 * T061: Walk Away button with state management (disabled if answer locked)
 */
@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatDialogModule
  ],
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

  /**
   * Whether question timer is active and running
   */
  public hasQuestionTimer = false;
  public questionTimerRunning = false;
  public questionTimerExpired = false;

  /**
   * T131: Available level options for override
   */
  public availableLevels = Array.from({ length: 15 }, (_, i) => i + 1);
  public currentLevel = 1;

  /**
   * T132: Lifeline states for reset checkboxes
   */
  public fiftyFiftyUsed = false;
  public askAudienceUsed = false;
  public phoneFriendUsed = false;

  /**
   * Whether connection status is hidden on seat display
   */
  public hideConnectionStatus = true;

  constructor(
    private gameStateService: GameStateService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Subscribe to game state changes
    this.stateSubscription = this.gameStateService.gameState$.subscribe(state => {
      this.currentPhase = state.phase;

      // T063: Disable walk away button if answer locked, game ended, or between questions
      this.walkAwayDisabled =
        state.phase === GamePhase.FINAL_LOCKED ||
        state.phase === GamePhase.REVEAL ||
        state.phase === GamePhase.ENDED ||
        state.phase === GamePhase.SETUP ||
        state.phase === GamePhase.BETWEEN;

      // T099: Track question timer state
      this.hasQuestionTimer = !!state.questionTimer;
      this.questionTimerRunning = state.questionTimer?.isRunning ?? false;
      this.questionTimerExpired = state.questionTimer?.isExpired ?? false;

      // T131: Track current level
      this.currentLevel = state.currentLevel;

      // T132: Track lifeline states
      this.fiftyFiftyUsed = state.lifelines.fiftyFifty.used;
      this.askAudienceUsed = state.lifelines.askAudience.used;
      this.phoneFriendUsed = state.lifelines.phoneFriend.used;

      this.hideConnectionStatus = state.hideConnectionStatus;
    });
  }

  ngOnDestroy(): void {
    this.stateSubscription?.unsubscribe();
  }

  /**
   * T062: Trigger walk away - contestant keeps last cleared level winnings
   */
  public onWalkAway(): void {
    if (this.walkAwayDisabled) {
      return;
    }

    this.dialog
      .open(WalkAwayConfirmationDialogComponent)
      .afterClosed()
      .subscribe(confirmed => {
        if (confirmed && !this.walkAwayDisabled) {
          this.gameStateService.walkAway();
        }
      });
  }

  /**
   * T099: Pause question timer
   */
  public pauseQuestionTimer(): void {
    this.gameStateService.pauseQuestionTimer();
  }

  /**
   * T099: Resume question timer
   */
  public resumeQuestionTimer(): void {
    this.gameStateService.resumeQuestionTimer();
  }

  /**
   * T099: Reset question timer to initial duration
   */
  public resetQuestionTimer(): void {
    this.gameStateService.resetQuestionTimer();
  }

  /**
   * T131: Override current level
   */
  public onOverrideLevel(newLevel: number): void {
    if (confirm(`Override current level to ${newLevel}? This will change the game state.`)) {
      this.gameStateService.overrideLevel(newLevel);
    }
  }

  /**
   * T132: Reset lifeline state (make available again)
   */
  public onResetLifeline(lifelineType: 'fiftyFifty' | 'askAudience' | 'phoneFriend'): void {
    if (confirm(`Reset ${this.formatLifelineName(lifelineType)} lifeline? It will become available again.`)) {
      this.gameStateService.resetLifeline(lifelineType);
    }
  }

  /**
   * T133: End game immediately
   */
  public onEndGame(): void {
    if (confirm('End the game immediately? Final winnings will be calculated.')) {
      this.gameStateService.endGame('walkaway');
    }
  }

  /**
   * T134: Reset game to SETUP phase
   */
  public onResetGame(): void {
    if (confirm('Reset game to setup? All progress will be lost.')) {
      this.gameStateService.resetGame();
    }
  }

  /**
   * Toggle connection status visibility
   */
  public toggleConnectionStatus(): void {
    this.gameStateService.setConnectionStatusVisibility(!this.hideConnectionStatus);
  }

  /**
   * Format lifeline name for display
   */
  private formatLifelineName(type: string): string {
    const names: Record<string, string> = {
      fiftyFifty: '50:50',
      askAudience: 'Ask the Audience',
      phoneFriend: 'Phone a Friend'
    };
    return names[type] || type;
  }
}
