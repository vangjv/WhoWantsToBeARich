import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ValidationErrorDialogComponent, ValidationErrorData } from '../validation-error-dialog/validation-error-dialog.component';
import { LadderConfigDialogComponent } from '../ladder-config-dialog/ladder-config-dialog.component';
import { GameStateService } from '../../services/game-state.service';
import { QuestionPackService } from '../../services/question-pack.service';
import { LadderConfigService } from '../../services/ladder-config.service';
import { QuestionPack } from '../../models/question.model';
import { MoneyLadder } from '../../models/money-ladder.model';

/**
 * Game Setup Component
 * Purpose: Configure game settings before starting
 * Features:
 * - Contestant name input
 * - Question pack selection
 * - Start Game button
 */
@Component({
  selector: 'app-game-setup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatSliderModule,
    MatDialogModule
  ],
  templateUrl: './game-setup.component.html',
  styleUrls: ['./game-setup.component.scss']
})
export class GameSetupComponent implements OnInit {
  contestantName = '';
  selectedPackId: string | null = null;
  availablePacks: QuestionPack[] = [];
  importError: string | null = null;

  // Question timer configuration
  questionTimerEnabled = false;
  questionTimerDuration = 60; // Default 60 seconds

  constructor(
    private gameStateService: GameStateService,
    private questionPackService: QuestionPackService,
    private ladderConfigService: LadderConfigService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAvailablePacks();
  }

  loadAvailablePacks(): void {
    this.questionPackService.getAvailablePacks().subscribe(packs => {
      this.availablePacks = packs;
    });
  }

  async onFileSelect(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    try {
      // Import and validate the pack
      const result = await this.questionPackService.importPack(file);

      if (!result.valid || !result.pack) {
        // T110: Show validation error dialog with specific issues
        this.showValidationErrorDialog(file.name, result.errors);
        this.importError = `Validation failed: ${result.errors.length} error(s) found`;
      } else {
        // Save the pack and update list
        this.questionPackService.savePack(result.pack);
        this.loadAvailablePacks();
        this.selectedPackId = result.pack.id;
        this.importError = null;
      }
    } catch (error) {
      this.importError = error instanceof Error ? error.message : 'Failed to import question pack';
    }

    // Reset input
    input.value = '';
  }

  /**
   * T110: Show validation error dialog with specific issues
   */
  private showValidationErrorDialog(fileName: string, errors: string[]): void {
    const data: ValidationErrorData = {
      fileName,
      errors
    };

    this.dialog.open(ValidationErrorDialogComponent, {
      width: '600px',
      data
    });
  }

  canStartGame(): boolean {
    return !!this.contestantName.trim() && !!this.selectedPackId;
  }

  startGame(): void {
    if (!this.canStartGame()) {
      return;
    }

    const selectedPack = this.availablePacks.find(pack => pack.id === this.selectedPackId);
    if (!selectedPack) {
      return;
    }

    // Configure timer if enabled
    const timerConfig = this.questionTimerEnabled ? this.questionTimerDuration : null;
    this.gameStateService.startGame(this.contestantName.trim(), selectedPack, timerConfig);
  }

  formatTimerLabel(value: number): string {
    return `${value}s`;
  }

  /**
   * T116: Open ladder configuration dialog
   */
  openLadderConfigDialog(): void {
    const currentLadder = this.ladderConfigService.getLadder();

    const dialogRef = this.dialog.open(LadderConfigDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { ladder: currentLadder }
    });

    dialogRef.afterClosed().subscribe((result: MoneyLadder | undefined) => {
      if (result) {
        this.ladderConfigService.saveConfig(result);
      }
    });
  }
}
