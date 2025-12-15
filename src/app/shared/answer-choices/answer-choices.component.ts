import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Choice } from '../../models/question.model';
import { ChoiceKey } from '../../models/choice-key.model';

/**
 * Answer Choices Component
 * Purpose: Display answer choices with visual states
 * States:
 * - neutral: Default state
 * - removed: Grayed out by 50:50 lifeline
 * - selected: Contestant's current selection
 * - locked: Final answer locked
 * - revealed-correct: Correct answer revealed (green)
 * - revealed-incorrect: Incorrect answer revealed (red)
 */
@Component({
  selector: 'app-answer-choices',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './answer-choices.component.html',
  styleUrls: ['./answer-choices.component.scss']
})
export class AnswerChoicesComponent {
  @Input() choices: Choice[] = [];
  @Input() selectedChoice: ChoiceKey | null = null;
  @Input() finalAnswer: ChoiceKey | null = null;
  @Input() correctAnswer: ChoiceKey | null = null;
  @Input() removedChoices: ChoiceKey[] = [];
  @Input() isHostView = false;

  @Output() choiceSelected = new EventEmitter<ChoiceKey>();

  onChoiceClick(choice: Choice): void {
    if (this.isHostView && !this.isRemoved(choice.key) && !this.finalAnswer) {
      this.choiceSelected.emit(choice.key);
    }
  }

  isRemoved(key: ChoiceKey): boolean {
    return this.removedChoices.includes(key);
  }

  isSelected(key: ChoiceKey): boolean {
    return this.selectedChoice === key && !this.finalAnswer;
  }

  isLocked(key: ChoiceKey): boolean {
    return this.finalAnswer === key && !this.correctAnswer;
  }

  isRevealedCorrect(key: ChoiceKey): boolean {
    return this.correctAnswer === key;
  }

  isRevealedIncorrect(key: ChoiceKey): boolean {
    return this.correctAnswer !== null &&
           this.finalAnswer === key &&
           this.correctAnswer !== key;
  }

  getChoiceClass(choice: Choice): string {
    const key = choice.key;
    const classes: string[] = ['choice'];

    if (this.isRemoved(key)) {
      classes.push('removed');
    } else if (this.isRevealedCorrect(key)) {
      classes.push('revealed-correct');
    } else if (this.isRevealedIncorrect(key)) {
      classes.push('revealed-incorrect');
    } else if (this.isLocked(key)) {
      classes.push('locked');
    } else if (this.isSelected(key)) {
      classes.push('selected');
    }

    if (this.isHostView && !this.finalAnswer && !this.isRemoved(key)) {
      classes.push('clickable');
    }

    return classes.join(' ');
  }
}
