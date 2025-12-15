import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { GameStateService } from '../../services/game-state.service';
import { QuestionPackService } from '../../services/question-pack.service';
import { QuestionPack } from '../../models/question.model';

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
    MatCardModule
  ],
  templateUrl: './game-setup.component.html',
  styleUrls: ['./game-setup.component.scss']
})
export class GameSetupComponent implements OnInit {
  contestantName = '';
  selectedPackId: string | null = null;
  availablePacks: QuestionPack[] = [];
  importError: string | null = null;

  constructor(
    private gameStateService: GameStateService,
    private questionPackService: QuestionPackService
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
      const pack = await this.questionPackService.importQuestionPack(file);
      this.availablePacks = [...this.availablePacks, pack];
      this.selectedPackId = pack.id;
      this.importError = null;
    } catch (error) {
      this.importError = error instanceof Error ? error.message : 'Failed to import question pack';
    }

    // Reset input
    input.value = '';
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

    this.gameStateService.startGame(this.contestantName.trim(), selectedPack);
  }
}
