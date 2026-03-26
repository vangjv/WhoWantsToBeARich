import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SyncService } from './sync.service';

export interface Sound {
  id: string;
  name: string;
  filename: string;
}

type AudioCommandAction = 'play' | 'stop' | 'pause' | 'resume';

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private readonly loopingSoundIds = new Set([
    'main-theme',
    '100-1k',
    '2k-32k',
    '64k-125k',
    '250k-500k',
    '1m'
  ]);
  private readonly isSeatWindow =
    typeof window !== 'undefined' &&
    (window.name === 'rich-seat' || window.location.pathname.startsWith('/seat'));
  private audioMap = new Map<string, HTMLAudioElement>();
  private currentPlaying: HTMLAudioElement | null = null;
  private currentSoundId: string | null = null;
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

  constructor(private syncService: SyncService) {
    // Preload sounds
    this.sounds.forEach(sound => {
      const audio = new Audio();
      audio.src = `/sounds/${sound.filename}`;
      audio.load();
      this.audioMap.set(sound.id, audio);
    });

    this.initializeSync();
  }

  play(soundId: string): void {
    if (!this.isSeatWindow) {
      this.currentSoundId = this.loopingSoundIds.has(soundId) ? soundId : null;
      this.isPaused = false;
      this.isPausedSubject.next(false);
      this.sendAudioCommand('play', soundId);
      return;
    }

    this.playLocal(soundId);
  }

  stopAll(): void {
    if (!this.isSeatWindow) {
      this.currentSoundId = null;
      this.isPaused = false;
      this.isPausedSubject.next(false);
      this.sendAudioCommand('stop');
      return;
    }

    this.stopLocal();
  }

  pause(): void {
    if (!this.isSeatWindow) {
      this.isPaused = true;
      this.isPausedSubject.next(true);
      this.sendAudioCommand('pause');
      return;
    }

    if (this.currentPlaying) {
      this.currentPlaying.pause();
      this.isPaused = true;
      this.isPausedSubject.next(true);
    }
  }

  resume(): void {
    if (!this.isSeatWindow) {
      this.isPaused = false;
      this.isPausedSubject.next(false);
      this.sendAudioCommand('resume');
      return;
    }

    if (this.currentPlaying && this.isPaused) {
      this.currentPlaying.play().catch(err => console.error('Error resuming sound:', err));
    } else if (!this.currentPlaying && this.currentSoundId) {
      this.playLocal(this.currentSoundId);
      return;
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

  private initializeSync(): void {
    if (this.isSeatWindow) {
      this.syncService.onEvent('AUDIO_COMMAND').subscribe((event: any) => {
        this.handleAudioCommand(event.payload.action, event.payload.soundId);
      });
      this.syncService.onEvent('AUDIO_SYNC').subscribe((event: any) => {
        this.handleAudioSync(event.payload.currentSoundId, event.payload.isPaused);
      });
      return;
    }

    this.syncService.onEvent('STATE_SYNC_REQUEST').subscribe(() => {
      this.syncService.sendEvent('AUDIO_SYNC', {
        currentSoundId: this.currentSoundId,
        isPaused: this.isPaused
      });
    });
  }

  private sendAudioCommand(action: AudioCommandAction, soundId?: string): void {
    this.syncService.sendEvent('AUDIO_COMMAND', { action, soundId });
  }

  private handleAudioCommand(action: AudioCommandAction, soundId?: string): void {
    switch (action) {
      case 'play':
        if (soundId) {
          this.playLocal(soundId);
        }
        break;
      case 'stop':
        this.stopLocal();
        break;
      case 'pause':
        this.pause();
        break;
      case 'resume':
        this.resume();
        break;
    }
  }

  private handleAudioSync(soundId: string | null, paused: boolean): void {
    if (!soundId) {
      this.stopLocal();
      this.isPaused = paused;
      this.isPausedSubject.next(paused);
      return;
    }

    if (paused) {
      this.stopLocal();
      this.currentSoundId = soundId;
      this.isPaused = true;
      this.isPausedSubject.next(true);
      return;
    }

    this.playLocal(soundId);
  }

  private playLocal(soundId: string): void {
    if (this.isPaused) {
      this.isPaused = false;
      this.isPausedSubject.next(false);
    }

    this.stopLocal();

    const audio = this.audioMap.get(soundId);
    if (audio) {
      this.currentSoundId = soundId;
      audio.loop = this.loopingSoundIds.has(soundId);
      audio.currentTime = 0;
      audio.play().catch(err => console.error('Error playing sound:', err));
      this.currentPlaying = audio;

      // When audio ends, clear currentPlaying
      audio.onended = () => {
        if (this.currentPlaying === audio) {
          this.currentPlaying = null;
          if (!audio.loop) {
            this.currentSoundId = null;
          }
        }
      };
    }
  }

  private stopLocal(): void {
    if (this.currentPlaying) {
      this.currentPlaying.pause();
      this.currentPlaying.currentTime = 0;
      this.currentPlaying = null;
    }
    this.audioMap.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.currentSoundId = null;
    this.isPaused = false;
    this.isPausedSubject.next(false);
  }
}
