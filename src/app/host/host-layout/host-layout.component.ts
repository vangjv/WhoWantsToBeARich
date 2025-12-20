import { Component, OnInit, OnDestroy, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GameStateService } from '../../services/game-state.service';
import { SoundService } from '../../services/sound.service';
import { GameState } from '../../models/game-state.model';
import { GamePhase } from '../../models/game-phase.model';
import { TimerState } from '../../models/timer.model';
import { GameSetupComponent } from '../game-setup/game-setup.component';
import { QuestionControlComponent } from '../question-control/question-control.component';
import { HostLadderComponent } from '../host-ladder/host-ladder.component';
import { AdminPanelComponent } from '../admin-panel/admin-panel.component';
import { LifelineControlComponent } from '../lifeline-control/lifeline-control.component';
import { GameEndSummaryComponent } from '../../shared/game-end-summary/game-end-summary.component';
import { ConnectionStatusComponent } from '../../shared/connection-status/connection-status.component';
import { TimerComponent } from '../../shared/timer/timer.component';

/**
 * Host Layout Component - Root container for host control UI
 * Route: /host
 * Purpose: Displays all host controls for managing the game
 */
@Component({
  selector: 'app-host-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    GameSetupComponent,
    QuestionControlComponent,
    HostLadderComponent,
    AdminPanelComponent,
    LifelineControlComponent,
    GameEndSummaryComponent,
    ConnectionStatusComponent,
    TimerComponent
  ],
  templateUrl: './host-layout.component.html',
  styleUrls: ['./host-layout.component.scss']
})
export class HostLayoutComponent implements OnInit, OnDestroy {
  gameState: GameState | null = null;
  GamePhase = GamePhase; // Expose enum to template
  questionTimer = signal<TimerState | null>(null);
  isSoundPaused = false;

  @ViewChild(ConnectionStatusComponent) connectionStatus?: ConnectionStatusComponent;

  private destroy$ = new Subject<void>();
  private seatWindow: Window | null = null;

  constructor(
    private gameStateService: GameStateService,
    private soundService: SoundService
  ) {}

  ngOnInit(): void {
    // Subscribe to game state updates
    this.gameStateService.gameState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.gameState = state;
        this.questionTimer.set(state.questionTimer);
      });

    this.soundService.isPaused$
      .pipe(takeUntil(this.destroy$))
      .subscribe(paused => {
        this.isSoundPaused = paused;
      });

    // T055: Connection status polling - check if seat window is still open
    interval(2000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.checkSeatWindowStatus();
      });

    // T122a: Warn on browser close/refresh during active game
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Close seat window if still open
    if (this.seatWindow && !this.seatWindow.closed) {
      this.seatWindow.close();
    }

    // T122a: Remove beforeunload listener
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }

  toggleSound(): void {
    this.soundService.togglePause();
  }

  /**
   * T122a: Handle beforeunload event to warn about losing game state
   */
  private handleBeforeUnload = (event: BeforeUnloadEvent): string | undefined => {
    if (!this.gameState) {
      return undefined;
    }

    // Only warn if game is in active phase (not SETUP or ENDED)
    if (this.gameState.phase !== GamePhase.SETUP &&
        this.gameState.phase !== GamePhase.ENDED) {
      event.preventDefault();
      // Modern browsers require returnValue to be set
      event.returnValue = 'You have an active game in progress. Are you sure you want to leave?';
      return event.returnValue;
    }

    return undefined;
  }

  /**
   * T053: Open contestant display window
   * Opens /seat route in popup window with fullscreen features
   */
  openSeatDisplay(): void {
    // Check if seat window already exists and is open
    if (this.seatWindow && !this.seatWindow.closed) {
      this.seatWindow.focus();
      console.log('[HostLayout] Seat window already open, bringing to front');
      return;
    }

    const width = 1920;
    const height = 1080;
    const left = window.screen.availWidth - width;
    const top = 0;

    const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no`;

    this.seatWindow = window.open('/seat', 'millionaire-seat', features);

    if (this.seatWindow) {
      console.log('[HostLayout] Seat window opened successfully');
      // Register window with connection status component
      if (this.connectionStatus) {
        this.connectionStatus.registerSeatWindow(this.seatWindow);
      }
    } else {
      console.error('[HostLayout] Failed to open seat window - popup may be blocked');
    }
  }

  /**
   * T055: Check seat window status for connection indicator
   */
  private checkSeatWindowStatus(): void {
    if (this.seatWindow && this.seatWindow.closed) {
      console.log('[HostLayout] Seat window was closed');
      this.seatWindow = null;
    }
  }

  /**
   * Reset game to initial state
   */
  resetGame(): void {
    this.gameStateService.resetGame();
  }
}
