import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Question } from '../../models/question.model';
import { ChoiceKey } from '../../models/choice-key.model';
import { GamePhase } from '../../models/game-phase.model';
import { trigger, state, style, transition, animate } from '@angular/animations';

/**
 * Question Display Component (Seat)
 * Read-only question and choices display for contestant/audience second screen
 * Optimized for 1080p/4K display with show-style dramatic presentation
 */
@Component({
  selector: 'app-question-display',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './question-display.component.html',
  styleUrls: ['./question-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('revealAnimation', [
      state('hidden', style({ opacity: 0, transform: 'scale(0.8)' })),
      state('visible', style({ opacity: 1, transform: 'scale(1)' })),
      transition('hidden => visible', [
        animate('600ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ])
    ]),
    trigger('choiceReveal', [
      state('neutral', style({ backgroundColor: 'rgba(255, 255, 255, 0.05)' })),
      state('selected', style({ backgroundColor: 'rgba(255, 215, 0, 0.2)', border: '3px solid #ffd700' })),
      state('locked', style({ backgroundColor: 'rgba(255, 215, 0, 0.3)', border: '3px solid #ffd700' })),
      state('correct', style({ backgroundColor: 'rgba(0, 255, 0, 0.3)', border: '3px solid #00ff00' })),
      state('incorrect', style({ backgroundColor: 'rgba(255, 0, 0, 0.3)', border: '3px solid #ff0000' })),
      state('removed', style({ opacity: 0.3, textDecoration: 'line-through' })),
      transition('* => *', [
        animate('400ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ])
    ])
  ]
})
export class QuestionDisplayComponent {
  @Input() question: Question | null = null;
  @Input() selectedChoice: ChoiceKey | null = null;
  @Input() finalAnswer: ChoiceKey | null = null;
  @Input() correctAnswer: ChoiceKey | null = null;
  @Input() phase: GamePhase = GamePhase.SETUP;
  @Input() removedChoices: ChoiceKey[] = [];

  /**
   * Get animation state for a specific choice
   */
  getChoiceState(choiceKey: ChoiceKey): string {
    // Check if removed by 50:50
    if (this.removedChoices.includes(choiceKey)) {
      return 'removed';
    }

    // Reveal phase - show correct/incorrect
    if (this.phase === GamePhase.REVEAL && this.correctAnswer) {
      if (choiceKey === this.correctAnswer) {
        return 'correct';
      }
      if (choiceKey === this.finalAnswer && choiceKey !== this.correctAnswer) {
        return 'incorrect';
      }
    }

    // Final answer locked
    if (this.phase === GamePhase.FINAL_LOCKED && choiceKey === this.finalAnswer) {
      return 'locked';
    }

    // Selected but not locked
    if (choiceKey === this.selectedChoice) {
      return 'selected';
    }

    return 'neutral';
  }

  /**
   * Get reveal animation state
   */
  getRevealState(): string {
    return this.phase === GamePhase.REVEAL ? 'visible' : 'hidden';
  }

  /**
   * Track choices by key for ngFor performance
   */
  trackByKey(index: number, choice: any): string {
    return choice.key;
  }
}
