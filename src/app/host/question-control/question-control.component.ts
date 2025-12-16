import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GameStateService } from '../../services/game-state.service';
import { GameState } from '../../models/game-state.model';
import { GamePhase } from '../../models/game-phase.model';
import { ChoiceKey } from '../../models/choice-key.model';
import { AnswerChoicesComponent } from '../../shared/answer-choices/answer-choices.component';

/**
 * Question Control Component
 * Purpose: Host control panel for question flow
 * Features:
 * - Display current question
 * - Choice selection controls
 * - Lock Final Answer button
 * - Reveal button
 * - Host-only explanation/notes display
 */
@Component({
  selector: 'app-question-control',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    AnswerChoicesComponent
  ],
  templateUrl: './question-control.component.html',
  styleUrls: ['./question-control.component.scss']
})
export class QuestionControlComponent implements OnInit, OnDestroy {
  gameState: GameState | null = null;
  GamePhase = GamePhase;

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

  startQuestion(): void {
    this.gameStateService.startQuestion();
  }

  selectChoice(choice: ChoiceKey): void {
    if (!this.canSelectChoice()) {
      return;
    }
    this.gameStateService.selectChoice(choice);
  }

  lockFinalAnswer(): void {
    if (!this.canLockAnswer()) {
      return;
    }
    this.gameStateService.lockFinalAnswer();
  }

  revealAnswer(): void {
    if (!this.canReveal()) {
      return;
    }
    this.gameStateService.revealAnswer();
  }

  advanceLevel(): void {
    if (!this.canAdvanceLevel()) {
      return;
    }
    this.gameStateService.advanceLevel();
  }

  canStartQuestion(): boolean {
    return this.gameState?.phase === GamePhase.SETUP ||
           this.gameState?.phase === GamePhase.BETWEEN;
  }

  canSelectChoice(): boolean {
    return this.gameState?.phase === GamePhase.QUESTION;
  }

  canLockAnswer(): boolean {
    return this.gameState?.phase === GamePhase.QUESTION &&
           this.gameState?.selectedChoice !== null;
  }

  canReveal(): boolean {
    return this.gameState?.phase === GamePhase.FINAL_LOCKED;
  }

  canAdvanceLevel(): boolean {
    return this.gameState?.phase === GamePhase.REVEAL;
  }

  showQuestion(): boolean {
    return this.gameState?.currentQuestion !== null &&
           (this.gameState?.phase === GamePhase.QUESTION ||
            this.gameState?.phase === GamePhase.FINAL_LOCKED ||
            this.gameState?.phase === GamePhase.REVEAL);
  }

  showExplanation(): boolean {
    return this.showQuestion() &&
           !!this.gameState?.currentQuestion?.explanation;
  }
}
