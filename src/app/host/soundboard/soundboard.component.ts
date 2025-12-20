import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { SoundService, Sound } from '../../services/sound.service';

@Component({
  selector: 'app-soundboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule
  ],
  templateUrl: './soundboard.component.html',
  styleUrls: ['./soundboard.component.scss']
})
export class SoundboardComponent {
  sounds: Sound[];

  constructor(private soundService: SoundService) {
    this.sounds = this.soundService.sounds;
  }

  playSound(soundId: string): void {
    this.soundService.play(soundId);
  }

  stopAll(): void {
    this.soundService.stopAll();
  }
}
