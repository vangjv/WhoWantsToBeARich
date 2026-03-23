import { Injectable } from '@angular/core';
import { MoneyLadder, createDefaultLadder } from '../models/money-ladder.model';

/**
 * Service for managing money ladder configuration with localStorage persistence
 */
@Injectable({
  providedIn: 'root'
})
export class LadderConfigService {
  private readonly STORAGE_KEY = 'rich-ladder-config';
  private currentLadder: MoneyLadder = createDefaultLadder();

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Get current ladder configuration
   */
  public getLadder(): MoneyLadder {
    return { ...this.currentLadder };
  }

  /**
   * Save custom ladder configuration
   */
  public saveConfig(ladder: MoneyLadder): void {
    // Validate ladder
    if (!this.validateLadder(ladder)) {
      console.error('[LadderConfigService] Invalid ladder configuration');
      return;
    }

    this.currentLadder = ladder;
    this.saveToStorage();
    console.log('[LadderConfigService] Ladder configuration saved');
  }

  /**
   * Reset to default ladder
   */
  public resetToDefault(): void {
    this.currentLadder = createDefaultLadder();
    this.saveToStorage();
    console.log('[LadderConfigService] Reset to default ladder');
  }

  /**
   * Validate ladder configuration
   */
  private validateLadder(ladder: MoneyLadder): boolean {
    // Check 15 levels
    if (ladder.levels.length !== 15) {
      console.error('[LadderConfigService] Ladder must have exactly 15 levels');
      return false;
    }

    // Check level numbers are 1-15
    const levelNumbers = ladder.levels.map(l => l.levelNumber).sort((a, b) => a - b);
    const expected = Array.from({ length: 15 }, (_, i) => i + 1);
    if (JSON.stringify(levelNumbers) !== JSON.stringify(expected)) {
      console.error('[LadderConfigService] Level numbers must be 1-15');
      return false;
    }

    // Check all values are positive
    if (ladder.levels.some(l => l.value <= 0)) {
      console.error('[LadderConfigService] All values must be positive');
      return false;
    }

    // Check safe havens are valid level numbers
    if (ladder.safeHavens.some(sh => sh < 1 || sh > 15)) {
      console.error('[LadderConfigService] Safe havens must be between 1 and 15');
      return false;
    }

    return true;
  }

  /**
   * Load ladder configuration from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const ladder = JSON.parse(stored) as MoneyLadder;
        if (this.validateLadder(ladder)) {
          this.currentLadder = ladder;
          console.log('[LadderConfigService] Loaded ladder from storage');
        } else {
          console.warn('[LadderConfigService] Stored ladder invalid, using default');
        }
      }
    } catch (error) {
      console.error('[LadderConfigService] Failed to load from storage:', error);
    }
  }

  /**
   * Save ladder configuration to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentLadder));
    } catch (error) {
      console.error('[LadderConfigService] Failed to save to storage:', error);
    }
  }
}
