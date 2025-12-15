import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { GameState, createDefaultGameState, calculateWinnings } from '../models/game-state.model';
import { GamePhase } from '../models/game-phase.model';
import { Question, QuestionPack } from '../models/question.model';
import { ChoiceKey, LifelineType } from '../models/choice-key.model';
import { AudiencePercentages } from '../models/lifeline.model';
import { SyncService } from './sync.service';

/**
 * Service for managing game state and emitting sync events
 * Host-only service - seat consumes via SyncService
 */
@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private gameStateSubject = new BehaviorSubject<GameState>(createDefaultGameState());
  private timerSubscription: Subscription | null = null;

  /**
   * Observable stream of game state changes
   */
  public readonly gameState$: Observable<GameState> = this.gameStateSubject.asObservable();

  constructor(private syncService: SyncService) {
    // Listen for state sync requests from seat
    this.syncService.onEvent<any>('STATE_SYNC_REQUEST').subscribe(() => {
      this.sendFullStateSync();
    });
  }

  /**
   * Get current game state snapshot
   */
  public getState(): GameState {
    return this.gameStateSubject.value;
  }

  /**
   * Update game state and emit sync event
   */
  private updateState(updates: Partial<GameState>): void {
    const currentState = this.getState();
    const newState: GameState = { ...currentState, ...updates };
    this.gameStateSubject.next(newState);
  }

  /**
   * Send full state sync response to seat
   */
  public sendFullStateSync(): void {
    const state = this.getState();
    this.syncService.sendEvent('STATE_SYNC_RESPONSE', state);
  }

  /**
   * Initialize new game with question pack and contestant name
   */
  public setupGame(contestantName: string, questionPack: QuestionPack): void {
    const newState = createDefaultGameState();
    newState.contestantName = contestantName;
    newState.questionPack = questionPack;
    this.gameStateSubject.next(newState);
    console.log('[GameStateService] Game setup complete');
  }

  /**
   * Start a question at the current level
   */
  public startQuestion(): void {
    const state = this.getState();

    if (!state.questionPack) {
      console.error('[GameStateService] Cannot start question - no question pack loaded');
      return;
    }

    const question = state.questionPack.questions.find(q => q.level === state.currentLevel);

    if (!question) {
      console.error(`[GameStateService] No question found for level ${state.currentLevel}`);
      return;
    }

    this.updateState({
      phase: GamePhase.QUESTION,
      currentQuestion: question,
      selectedChoice: null,
      finalAnswer: null,
      correctAnswer: null
    });

    this.syncService.sendEvent('QUESTION_STARTED', { question });
    console.log(`[GameStateService] Started question for level ${state.currentLevel}`);
  }

  /**
   * Select a choice (before locking)
   */
  public selectChoice(choice: ChoiceKey): void {
    const state = this.getState();

    if (state.phase !== GamePhase.QUESTION) {
      console.warn('[GameStateService] Cannot select choice - not in QUESTION phase');
      return;
    }

    this.updateState({ selectedChoice: choice });
    this.syncService.sendEvent('CHOICE_SELECTED', { choice });
    console.log(`[GameStateService] Selected choice: ${choice}`);
  }

  /**
   * Lock final answer
   */
  public lockFinalAnswer(): void {
    const state = this.getState();

    if (!state.selectedChoice) {
      console.warn('[GameStateService] Cannot lock answer - no choice selected');
      return;
    }

    this.updateState({
      phase: GamePhase.FINAL_LOCKED,
      finalAnswer: state.selectedChoice
    });

    this.syncService.sendEvent('FINAL_LOCKED', { choice: state.selectedChoice });
    console.log(`[GameStateService] Final answer locked: ${state.selectedChoice}`);
  }

  /**
   * Reveal correct answer
   */
  public revealAnswer(): void {
    const state = this.getState();

    if (state.phase !== GamePhase.FINAL_LOCKED || !state.currentQuestion || !state.finalAnswer) {
      console.warn('[GameStateService] Cannot reveal - invalid state');
      return;
    }

    const correct = state.finalAnswer === state.currentQuestion.correctAnswer;

    this.updateState({
      phase: GamePhase.REVEAL,
      correctAnswer: state.currentQuestion.correctAnswer
    });

    this.syncService.sendEvent('REVEAL_SHOWN', {
      correct,
      correctAnswer: state.currentQuestion.correctAnswer
    });

    console.log(`[GameStateService] Revealed answer: ${state.currentQuestion.correctAnswer}, correct: ${correct}`);

    // Handle outcome
    if (correct) {
      // Correct answer - can advance or end if level 15
      if (state.currentLevel === 15) {
        this.endGame('win');
      }
    } else {
      // Incorrect answer - end game with safe haven winnings
      this.endGame('lose');
    }
  }

  /**
   * Advance to next level
   */
  public advanceLevel(): void {
    const state = this.getState();

    if (state.phase !== GamePhase.REVEAL) {
      console.warn('[GameStateService] Cannot advance - not in REVEAL phase');
      return;
    }

    const newLevel = state.currentLevel + 1;
    const newClearedLevel = state.currentLevel;

    this.updateState({
      phase: GamePhase.BETWEEN,
      currentLevel: newLevel,
      clearedLevel: newClearedLevel,
      currentQuestion: null,
      selectedChoice: null,
      finalAnswer: null,
      correctAnswer: null
    });

    this.syncService.sendEvent('LEVEL_ADVANCED', {
      level: newLevel,
      clearedLevel: newClearedLevel
    });

    console.log(`[GameStateService] Advanced to level ${newLevel}`);
  }

  /**
   * Walk away from current question
   */
  public walkAway(): void {
    const state = this.getState();

    if (state.phase === GamePhase.FINAL_LOCKED || state.phase === GamePhase.REVEAL) {
      console.warn('[GameStateService] Cannot walk away - answer already locked or revealed');
      return;
    }

    const winnings = state.clearedLevel > 0
      ? state.ladder.levels[state.clearedLevel - 1].value
      : 0;

    this.updateState({
      walkAway: true,
      finalWinnings: winnings,
      phase: GamePhase.ENDED
    });

    this.syncService.sendEvent('WALK_AWAY', { winnings });
    this.syncService.sendEvent('GAME_ENDED', {
      winnings,
      walkAway: true,
      reason: 'walkaway'
    });

    console.log(`[GameStateService] Walk away - winnings: $${winnings}`);
  }

  /**
   * End game
   */
  public endGame(reason: 'win' | 'lose' | 'walkaway'): void {
    const state = this.getState();
    const winnings = reason === 'win'
      ? state.ladder.levels[14].value // Level 15 value (index 14)
      : calculateWinnings(state);

    this.updateState({
      phase: GamePhase.ENDED,
      finalWinnings: winnings
    });

    this.syncService.sendEvent('GAME_ENDED', {
      winnings,
      walkAway: state.walkAway,
      reason
    });

    console.log(`[GameStateService] Game ended - ${reason}, winnings: $${winnings}`);
  }

  /**
   * Use 50:50 lifeline
   */
  public useFiftyFifty(): void {
    const state = this.getState();

    if (state.lifelines.fiftyFifty.used) {
      console.warn('[GameStateService] 50:50 already used');
      return;
    }

    if (!state.currentQuestion) {
      console.warn('[GameStateService] No current question');
      return;
    }

    // Get incorrect choices
    const incorrectChoices = state.currentQuestion.choices
      .filter(c => c.key !== state.currentQuestion!.correctAnswer)
      .map(c => c.key);

    // Randomly remove 2 of the 3 incorrect choices
    const shuffled = incorrectChoices.sort(() => Math.random() - 0.5);
    const removedChoices = shuffled.slice(0, 2) as ChoiceKey[];

    // Update state
    const updatedLifelines = { ...state.lifelines };
    updatedLifelines.fiftyFifty = {
      used: true,
      removedChoices
    };

    this.updateState({ lifelines: updatedLifelines });

    this.syncService.sendEvent('LIFELINE_USED', {
      type: 'fiftyFifty' as LifelineType,
      data: { removedChoices }
    });

    console.log('[GameStateService] 50:50 used, removed:', removedChoices);
  }

  /**
   * Use Ask the Audience lifeline
   */
  public useAskAudience(percentages: AudiencePercentages): void {
    const state = this.getState();

    if (state.lifelines.askAudience.used) {
      console.warn('[GameStateService] Ask the Audience already used');
      return;
    }

    // Update state
    const updatedLifelines = { ...state.lifelines };
    updatedLifelines.askAudience = {
      used: true,
      percentages
    };

    this.updateState({ lifelines: updatedLifelines });

    this.syncService.sendEvent('LIFELINE_USED', {
      type: 'askAudience' as LifelineType,
      data: { percentages }
    });

    console.log('[GameStateService] Ask the Audience used:', percentages);
  }

  /**
   * Use Phone a Friend lifeline
   */
  public usePhoneFriend(suggestion: string | null, startTimer: boolean): void {
    const state = this.getState();

    if (state.lifelines.phoneFriend.used) {
      console.warn('[GameStateService] Phone a Friend already used');
      return;
    }

    // Update state
    const updatedLifelines = { ...state.lifelines };
    updatedLifelines.phoneFriend = {
      used: true,
      suggestion,
      timer: startTimer ? {
        durationSeconds: 30,
        remainingSeconds: 30,
        isRunning: true,
        isExpired: false
      } : null
    };

    this.updateState({ lifelines: updatedLifelines });

    this.syncService.sendEvent('LIFELINE_USED', {
      type: 'phoneFriend' as LifelineType,
      data: { suggestion, timerStarted: startTimer }
    });

    if (startTimer) {
      this.startPhoneFriendTimer();
    }

    console.log('[GameStateService] Phone a Friend used, timer:', startTimer);
  }

  /**
   * Start Phone a Friend timer
   */
  private startPhoneFriendTimer(): void {
    this.stopTimer();

    this.timerSubscription = interval(1000).subscribe(() => {
      const state = this.getState();
      const timer = state.lifelines.phoneFriend.timer;

      if (!timer || timer.remainingSeconds <= 0) {
        this.stopTimer();
        this.syncService.sendEvent('TIMER_EXPIRED', null);
        return;
      }

      const newRemaining = timer.remainingSeconds - 1;

      const updatedLifelines = { ...state.lifelines };
      updatedLifelines.phoneFriend = {
        ...updatedLifelines.phoneFriend,
        timer: {
          ...timer,
          remainingSeconds: newRemaining,
          isExpired: newRemaining === 0
        }
      };

      this.updateState({ lifelines: updatedLifelines });
      this.syncService.sendEvent('TIMER_TICK', { remaining: newRemaining });
    });
  }

  /**
   * Stop active timer
   */
  private stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }

  /**
   * Reset game to initial state
   */
  public resetGame(): void {
    this.stopTimer();
    this.gameStateSubject.next(createDefaultGameState());
    console.log('[GameStateService] Game reset');
  }
}
