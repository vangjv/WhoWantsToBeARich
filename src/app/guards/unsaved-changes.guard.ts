import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { HostLayoutComponent } from '../host/host-layout/host-layout.component';
import { GameStateService } from '../services/game-state.service';
import { GamePhase } from '../models/game-phase.model';

/**
 * Guard to warn user before navigating away from host during active game
 * Prevents accidental navigation that would lose game state
 */
@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuard implements CanDeactivate<HostLayoutComponent> {
  constructor(private gameStateService: GameStateService) {}

  canDeactivate(
    component: HostLayoutComponent
  ): Observable<boolean> | Promise<boolean> | boolean {
    const currentState = this.gameStateService.getCurrentState();

    // Allow navigation if game is in SETUP or ENDED phase
    if (!currentState ||
        currentState.phase === GamePhase.SETUP ||
        currentState.phase === GamePhase.ENDED) {
      return true;
    }

    // Warn user about losing active game state
    return confirm(
      'You have an active game in progress. Are you sure you want to leave? All game progress will be lost.'
    );
  }
}
