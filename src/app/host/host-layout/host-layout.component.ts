import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GameStateService } from '../../services/game-state.service';
import { GameState } from '../../models/game-state.model';
import { GamePhase } from '../../models/game-phase.model';
import { GameSetupComponent } from '../game-setup/game-setup.component';
import { QuestionControlComponent } from '../question-control/question-control.component';
import { HostLadderComponent } from '../host-ladder/host-ladder.component';
import { AdminPanelComponent } from '../admin-panel/admin-panel.component';
import { GameEndSummaryComponent } from '../../shared/game-end-summary/game-end-summary.component';

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
    GameSetupComponent,
    QuestionControlComponent,
    HostLadderComponent,
    AdminPanelComponent,
    GameEndSummaryComponent
  ],
  templateUrl: './host-layout.component.html',
  styleUrls: ['./host-layout.component.scss']
})
export class HostLayoutComponent implements OnInit, OnDestroy {
  gameState: GameState | null = null;
  GamePhase = GamePhase; // Expose enum to template

  private destroy$ = new Subject<void>();

  constructor(private gameStateService: GameStateService) {}

  ngOnInit(): void {
    // Subscribe to game state updates
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

  /**
   * Open contestant display window
   * Opens /seat route in popup window with fullscreen features
   */
  openSeatDisplay(): void {
    const width = 1920;
    const height = 1080;
    const left = window.screen.availWidth - width;
    const top = 0;

    const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no`;

    window.open('/seat', 'millionaire-seat', features);
  }

  /**
   * Reset game to initial state
   */
  resetGame(): void {
    this.gameStateService.resetGame();
  }
}
