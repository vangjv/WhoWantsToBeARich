import { Component, OnInit, OnDestroy, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { SyncService } from '../../services/sync.service';
import { GameState } from '../../models/game-state.model';
import { GamePhase } from '../../models/game-phase.model';
import { Question } from '../../models/question.model';
import { MoneyLadder } from '../../models/money-ladder.model';
import { LifelineState } from '../../models/lifeline.model';
import { ChoiceKey } from '../../models/choice-key.model';
import { QuestionDisplayComponent } from '../question-display/question-display.component';
import { SeatLadderComponent } from '../seat-ladder/seat-ladder.component';
import { LifelineStatusComponent } from '../lifeline-status/lifeline-status.component';
import { TimerComponent } from '../../shared/timer/timer.component';
import { TimerState } from '../../models/timer.model';

/**
 * Seat Layout Component - Contestant/Audience Display (Second Screen)
 * Route: /seat
 * Purpose: Read-only synchronized display optimized for 1080p/4K viewing
 *
 * Responsibilities:
 * - Request full state sync on initialization (T050)
 * - Listen to BroadcastChannel sync events (T049)
 * - Reconstruct local state from sync events (T052)
 * - Display question, ladder, and lifeline status
 */
@Component({
  selector: 'app-seat-layout',
  standalone: true,
  imports: [
    CommonModule,
    QuestionDisplayComponent,
    SeatLadderComponent,
    LifelineStatusComponent,
    TimerComponent
  ],
  templateUrl: './seat-layout.component.html',
  styleUrls: ['./seat-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeatLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Local state signals (read-only, synced from host)
  gameState = signal<GameState | null>(null);
  phase = signal<GamePhase>(GamePhase.SETUP);
  contestantName = signal<string | null>(null);
  currentQuestion = signal<Question | null>(null);
  questionVisible = signal<boolean>(false);
  visibleQuestion = computed(() => this.questionVisible() ? this.currentQuestion() : null);
  currentLevel = signal<number>(1);
  clearedLevel = signal<number>(0);
  selectedChoice = signal<ChoiceKey | null>(null);
  finalAnswer = signal<ChoiceKey | null>(null);
  correctAnswer = signal<ChoiceKey | null>(null);
  ladder = signal<MoneyLadder | null>(null);
  lifelines = signal<LifelineState | null>(null);
  removedChoices = signal<ChoiceKey[]>([]);
  isConnected = signal<boolean>(false);
  // T065: Walk away state
  walkAwayWinnings = signal<number>(0);
  didWalkAway = signal<boolean>(false);
  // T097: Question timer state
  questionTimer = signal<TimerState | null>(null);
  hideConnectionStatus = signal<boolean>(true);

  constructor(private syncService: SyncService) {}

  ngOnInit(): void {
    this.setupSyncListeners();
    this.requestStateSync();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * T050: Send STATE_SYNC_REQUEST on initialization
   */
  private requestStateSync(): void {
    console.log('[SeatLayout] Requesting state sync...');
    this.syncService.sendEvent('STATE_SYNC_REQUEST', null);
  }

  /**
   * T049: Setup BroadcastChannel event listeners
   * T052: State reconstruction from sync events
   */
  private setupSyncListeners(): void {
    // Listen for STATE_SYNC_RESPONSE (full state snapshot)
    this.syncService.onEvent('STATE_SYNC_RESPONSE')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        console.log('[SeatLayout] Received full state sync', event.payload);
        this.applyFullState(event.payload);
      });

    // Listen for QUESTION_STARTED
    this.syncService.onEvent('QUESTION_STARTED')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        console.log('[SeatLayout] Question started', event.payload);
        this.currentQuestion.set(event.payload.question);
        this.questionVisible.set(false); // Hidden by default
        this.phase.set(GamePhase.QUESTION);
        this.selectedChoice.set(null);
        this.finalAnswer.set(null);
        this.correctAnswer.set(null);
        this.removedChoices.set([]);
      });

    // Listen for QUESTION_VISIBILITY_CHANGED
    this.syncService.onEvent('QUESTION_VISIBILITY_CHANGED')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        console.log('[SeatLayout] Question visibility changed', event.payload);
        this.questionVisible.set(event.payload.visible);
      });

    // Listen for CHOICE_SELECTED
    this.syncService.onEvent('CHOICE_SELECTED')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        console.log('[SeatLayout] Choice selected', event.payload);
        this.selectedChoice.set(event.payload.choice);
      });

    // Listen for FINAL_LOCKED
    this.syncService.onEvent('FINAL_LOCKED')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        console.log('[SeatLayout] Final answer locked', event.payload);
        this.finalAnswer.set(event.payload.choice);
        this.phase.set(GamePhase.FINAL_LOCKED);
      });

    // Listen for REVEAL_SHOWN
    this.syncService.onEvent('REVEAL_SHOWN')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        console.log('[SeatLayout] Reveal shown', event.payload);
        this.correctAnswer.set(event.payload.correctAnswer);
        this.phase.set(GamePhase.REVEAL);
      });

    // Listen for LEVEL_ADVANCED
    this.syncService.onEvent('LEVEL_ADVANCED')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        console.log('[SeatLayout] Level advanced', event.payload);
        this.currentLevel.set(event.payload.level);
        this.clearedLevel.set(event.payload.clearedLevel);
        this.phase.set(GamePhase.BETWEEN);
      });

    // Listen for LIFELINE_USED
    this.syncService.onEvent('LIFELINE_USED')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        console.log('[SeatLayout] Lifeline used', event.payload);
        this.applyLifelineUpdate(event.payload);
      });

    // T065: Listen for WALK_AWAY event
    this.syncService.onEvent('WALK_AWAY')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        console.log('[SeatLayout] Walk away', event.payload);
        this.didWalkAway.set(true);
        this.walkAwayWinnings.set(event.payload.winnings);
        this.phase.set(GamePhase.ENDED);
      });

    // Listen for GAME_ENDED
    this.syncService.onEvent('GAME_ENDED')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        console.log('[SeatLayout] Game ended', event.payload);
        this.phase.set(GamePhase.ENDED);
      });

    // T097: Listen for TIMER_TICK (question timer updates)
    this.syncService.onEvent('TIMER_TICK')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        const currentTimer = this.questionTimer();
        if (currentTimer) {
          this.questionTimer.set({
            ...currentTimer,
            remainingSeconds: event.payload.remaining,
            isRunning: event.payload.isRunning ?? currentTimer.isRunning,
            isExpired: event.payload.isExpired ?? currentTimer.isExpired
          });
        }
      });

    // T097: Listen for TIMER_EXPIRED (question timer expired)
    this.syncService.onEvent('TIMER_EXPIRED')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const currentTimer = this.questionTimer();
        if (currentTimer) {
          this.questionTimer.set({
            ...currentTimer,
            remainingSeconds: 0,
            isExpired: true,
            isRunning: false
          });
        }
      });

    // Check if channel is available
    this.isConnected.set(this.syncService.isChannelAvailable());
  }

  /**
   * Apply full state snapshot from STATE_SYNC_RESPONSE
   */
  private applyFullState(state: GameState): void {
    this.gameState.set(state);
    this.phase.set(state.phase);
    this.contestantName.set(state.contestantName);
    this.currentQuestion.set(state.currentQuestion);
    this.questionVisible.set(state.questionVisible);
    this.currentLevel.set(state.currentLevel);
    this.clearedLevel.set(state.clearedLevel);
    this.selectedChoice.set(state.selectedChoice);
    this.finalAnswer.set(state.finalAnswer);
    this.correctAnswer.set(state.correctAnswer);
    this.ladder.set(state.ladder);
    this.lifelines.set(state.lifelines);
    this.removedChoices.set(state.lifelines.fiftyFifty.removedChoices);
    this.questionTimer.set(state.questionTimer);
    this.hideConnectionStatus.set(state.hideConnectionStatus);
    this.isConnected.set(true);
  }

  /**
   * Apply lifeline update from LIFELINE_USED event
   */
  private applyLifelineUpdate(payload: any): void {
    const currentLifelines = this.lifelines();
    if (!currentLifelines) return;

    const updatedLifelines = { ...currentLifelines };

    switch (payload.type) {
      case 'fiftyFifty':
        updatedLifelines.fiftyFifty = {
          used: true,
          removedChoices: payload.data.removedChoices
        };
        this.removedChoices.set(payload.data.removedChoices);
        break;

      case 'askAudience':
        updatedLifelines.askAudience = {
          used: true,
          percentages: payload.data.percentages
        };
        break;

      case 'phoneFriend':
        updatedLifelines.phoneFriend = {
          used: true,
          suggestion: payload.data.suggestion,
          timer: null // Timer handled separately if needed
        };
        break;
    }

    this.lifelines.set(updatedLifelines);
  }
}
