import { ChoiceKey } from './choice-key.model';

/**
 * Forward declaration - TimerState defined in timer.model.ts
 * Using conditional type to avoid circular dependency
 */
export interface TimerState {
  durationSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isExpired: boolean;
}

/**
 * 50:50 lifeline state
 */
export interface FiftyFiftyState {
  used: boolean;
  removedChoices: ChoiceKey[];
}

/**
 * Audience voting percentages (must sum to 100)
 */
export interface AudiencePercentages {
  A: number;
  B: number;
  C: number;
  D: number;
}

/**
 * Ask the Audience lifeline state
 */
export interface AskAudienceState {
  used: boolean;
  percentages: AudiencePercentages | null;
}

/**
 * Phone a Friend lifeline state
 */
export interface PhoneFriendState {
  used: boolean;
  suggestion: string | null;
  timer: TimerState | null;
}

/**
 * Combined state of all lifelines
 */
export interface LifelineState {
  fiftyFifty: FiftyFiftyState;
  askAudience: AskAudienceState;
  phoneFriend: PhoneFriendState;
}

/**
 * Create default lifeline state (all available)
 */
export function createDefaultLifelines(): LifelineState {
  return {
    fiftyFifty: {
      used: false,
      removedChoices: []
    },
    askAudience: {
      used: false,
      percentages: null
    },
    phoneFriend: {
      used: false,
      suggestion: null,
      timer: null
    }
  };
}
