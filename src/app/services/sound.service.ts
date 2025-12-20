import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Sound {
  id: string;
  name: string;
  filename: string;
}

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private audioMap = new Map<string, HTMLAudioElement>();
  private currentPlaying: HTMLAudioElement | null = null;
  private isPaused = false;

  // List of available sounds
  readonly sounds: Sound[] = [
    { id: 'main-theme', name: 'Main Theme', filename: 'main-theme.mp3' },
    { id: 'lets-play', name: 'Let\'s Play', filename: 'let-s-play.mp3' },
    { id: '100-1k', name: 'Questions 1-5 ($100-$1k)', filename: '100-1k-music.mp3' },
    { id: '2k-32k', name: 'Questions 6-10 ($2k-$32k)', filename: '2k-32k.mp3' },
    { id: '64k-125k', name: 'Questions 11-12 ($64k-$125k)', filename: '64k-125kmusic.mp3' },
    { id: '250k-500k', name: 'Question 13 ($250k-$500k)', filename: '250k-500k-music.mp3' },
    { id: '1m', name: 'Question 15 ($1M)', filename: '1000000-music.mp3' },
    { id: 'final-answer', name: 'Final Answer', filename: 'final-answer.mp3' },
    { id: 'correct-answer', name: 'Correct Answer', filename: 'correct-answer.mp3' },
    { id: 'wrong-answer', name: 'Wrong Answer', filename: 'wrong-answer.mp3' },
    { id: 'lifeline', name: 'Lifeline', filename: 'lifeline.mp3' }
  ];

  private isPausedSubject = new BehaviorSubject<boolean>(false);
  isPaused$ = this.isPausedSubject.asObservable();

  constructor() {
    // Preload sounds
    this.sounds.forEach(sound => {
      const audio = new Audio();
      audio.src = `/sounds/${sound.filename}`;
      audio.load();
      this.audioMap.set(sound.id, audio);
    });
  }

  play(soundId: string): void {
    if (this.isPaused) {
      // If globally paused, we might want to allow playing new sounds but they start paused?
      // Or just play them. The requirement says "pause and resume sounds".
      // Usually "pause" means pause currently playing.
      // If I play a new sound while paused, should it play?
      // Let's assume "Master Pause" stops everything and prevents new sounds until resumed?
      // Or just pauses the current one.
      // Let's assume it pauses current playback. If user clicks play, it should probably override pause or start playing.
      // Let's reset pause state if user explicitly plays a sound.
      this.resume();
    }

    this.stopAll();

    const audio = this.audioMap.get(soundId);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(err => console.error('Error playing sound:', err));
      this.currentPlaying = audio;

      // Loop background music tracks
      if (['main-theme', '100-1k', '2k-32k', '64k-125k', '250k-500k', '1m'].includes(soundId)) {
        audio.loop = true;
      } else {
        audio.loop = false;
      }

      // When audio ends, clear currentPlaying
      audio.onended = () => {
        if (this.currentPlaying === audio) {
          this.currentPlaying = null;
        }
      };
    }
  }

  stopAll(): void {
    if (this.currentPlaying) {
      this.currentPlaying.pause();
      this.currentPlaying.currentTime = 0;
      this.currentPlaying = null;
    }
    this.audioMap.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  pause(): void {
    if (this.currentPlaying) {
      this.currentPlaying.pause();
      this.isPaused = true;
      this.isPausedSubject.next(true);
    }
  }

  resume(): void {
    if (this.currentPlaying && this.isPaused) {
      this.currentPlaying.play().catch(err => console.error('Error resuming sound:', err));
    }
    this.isPaused = false;
    this.isPausedSubject.next(false);
  }

  togglePause(): void {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  playQuestionMusic(level: number): void {
    if (level >= 1 && level <= 5) {
      this.play('100-1k');
    } else if (level >= 6 && level <= 10) {
      this.play('2k-32k');
    } else if (level >= 11 && level <= 12) {
      this.play('64k-125k');
    } else if (level >= 13 && level <= 14) {
      this.play('250k-500k');
    } else if (level === 15) {
      this.play('1m');
    }
  }
}
