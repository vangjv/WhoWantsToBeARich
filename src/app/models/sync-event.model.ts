import { GameState } from './game-state.model';
import { Question } from './question.model';
import { ChoiceKey, LifelineType } from './choice-key.model';
import { AudiencePercentages } from './lifeline.model';

/**
 * Base event structure
 */
export interface BaseSyncEvent {
  type: string;
  timestamp: number;
}

/**
 * Seat requests full state sync
 */
export interface SyncEventStateSyncRequest extends BaseSyncEvent {
  type: 'STATE_SYNC_REQUEST';
  payload: null;
}

/**
 * Host sends full state snapshot
 */
export interface SyncEventStateSyncResponse extends BaseSyncEvent {
  type: 'STATE_SYNC_RESPONSE';
  payload: GameState;
}

/**
 * Host started a new question
 */
export interface SyncEventQuestionStarted extends BaseSyncEvent {
  type: 'QUESTION_STARTED';
  payload: {
    question: Question;
  };
}

/**
 * Host selected a choice (before locking)
 */
export interface SyncEventChoiceSelected extends BaseSyncEvent {
  type: 'CHOICE_SELECTED';
  payload: {
    choice: ChoiceKey;
  };
}

/**
 * Host locked final answer
 */
export interface SyncEventFinalLocked extends BaseSyncEvent {
  type: 'FINAL_LOCKED';
  payload: {
    choice: ChoiceKey;
  };
}

/**
 * Host revealed correct answer
 */
export interface SyncEventRevealShown extends BaseSyncEvent {
  type: 'REVEAL_SHOWN';
  payload: {
    correct: boolean;
    correctAnswer: ChoiceKey;
  };
}

/**
 * Host advanced to next level
 */
export interface SyncEventLevelAdvanced extends BaseSyncEvent {
  type: 'LEVEL_ADVANCED';
  payload: {
    level: number;
    clearedLevel: number;
  };
}

/**
 * Lifeline activation data types
 */
export interface FiftyFiftyData {
  removedChoices: ChoiceKey[];
}

export interface AskAudienceData {
  percentages: AudiencePercentages;
}

export interface PhoneFriendData {
  suggestion: string | null;
  timerStarted: boolean;
}

/**
 * Host activated a lifeline
 */
export interface SyncEventLifelineUsed extends BaseSyncEvent {
  type: 'LIFELINE_USED';
  payload: {
    type: LifelineType;
    data: FiftyFiftyData | AskAudienceData | PhoneFriendData;
  };
}

/**
 * Timer ticked (1/second)
 */
export interface SyncEventTimerTick extends BaseSyncEvent {
  type: 'TIMER_TICK';
  payload: {
    remaining: number;
  };
}

/**
 * Timer reached zero
 */
export interface SyncEventTimerExpired extends BaseSyncEvent {
  type: 'TIMER_EXPIRED';
  payload: null;
}

/**
 * Contestant walked away
 */
export interface SyncEventWalkAway extends BaseSyncEvent {
  type: 'WALK_AWAY';
  payload: {
    winnings: number;
  };
}

/**
 * Game ended (win/lose/walkaway)
 */
export interface SyncEventGameEnded extends BaseSyncEvent {
  type: 'GAME_ENDED';
  payload: {
    winnings: number;
    walkAway: boolean;
    reason: 'win' | 'lose' | 'walkaway';
  };
}

/**
 * Discriminated union of all sync event types
 * Used for BroadcastChannel communication
 */
export type SyncEvent =
  | SyncEventStateSyncRequest
  | SyncEventStateSyncResponse
  | SyncEventQuestionStarted
  | SyncEventChoiceSelected
  | SyncEventFinalLocked
  | SyncEventRevealShown
  | SyncEventLevelAdvanced
  | SyncEventLifelineUsed
  | SyncEventTimerTick
  | SyncEventTimerExpired
  | SyncEventWalkAway
  | SyncEventGameEnded;

/**
 * Type guard for sync events
 */
export function isSyncEvent(data: any): data is SyncEvent {
  return data && typeof data === 'object' && 'type' in data && 'timestamp' in data;
}
