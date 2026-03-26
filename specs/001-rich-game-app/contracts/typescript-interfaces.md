# TypeScript Interface Definitions

**Version**: 1.0.0  
**Date**: 2025-12-14

## Overview

This document provides complete TypeScript interface definitions for all data models in the application. These interfaces should be implemented in `/src/app/models/` directory.

---

## Core Game State

```typescript
/**
 * Root game state object - single source of truth
 * Owned by host, synchronized to seat via BroadcastChannel
 */
interface GameState {
  readonly gameId: string;
  phase: GamePhase;
  contestantName: string | null;
  currentLevel: number;
  clearedLevel: number;
  currentQuestion: Question | null;
  selectedChoice: ChoiceKey | null;
  finalAnswer: ChoiceKey | null;
  correctAnswer: ChoiceKey | null;
  ladder: MoneyLadder;
  lifelines: LifelineState;
  questionPack: QuestionPack | null;
  questionTimer: TimerState | null;
  finalWinnings: number;
  walkAway: boolean;
}

/**
 * Game flow phase enumeration
 */
enum GamePhase {
  SETUP = 'SETUP',
  QUESTION = 'QUESTION',
  FINAL_LOCKED = 'FINAL_LOCKED',
  REVEAL = 'REVEAL',
  BETWEEN = 'BETWEEN',
  ENDED = 'ENDED'
}
```

---

## Questions

```typescript
/**
 * A single trivia question
 */
interface Question {
  readonly id: string;
  level: number;
  text: string;
  choices: Choice[];
  correctAnswer: ChoiceKey;
  category?: string;
  difficulty?: Difficulty;
  explanation?: string;
  mediaUrl?: string;
}

/**
 * An answer choice for a question
 */
interface Choice {
  key: ChoiceKey;
  text: string;
}

/**
 * Valid answer choice keys
 */
type ChoiceKey = 'A' | 'B' | 'C' | 'D';

/**
 * Question difficulty levels (optional metadata)
 */
type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * A collection of questions (importable from JSON)
 */
interface QuestionPack {
  readonly id: string;
  name: string;
  description?: string;
  creator?: string;
  questions: Question[];
}
```

---

## Money Ladder

```typescript
/**
 * Money ladder configuration (15 levels + safe havens)
 */
interface MoneyLadder {
  levels: LadderLevel[];
  safeHavens: number[];
}

/**
 * A single level in the money ladder
 */
interface LadderLevel {
  levelNumber: number;
  value: number;
}
```

---

## Lifelines

```typescript
/**
 * Combined state of all lifelines
 */
interface LifelineState {
  fiftyFifty: FiftyFiftyState;
  askAudience: AskAudienceState;
  phoneFriend: PhoneFriendState;
}

/**
 * 50:50 lifeline state
 */
interface FiftyFiftyState {
  used: boolean;
  removedChoices: ChoiceKey[];
}

/**
 * Ask the Audience lifeline state
 */
interface AskAudienceState {
  used: boolean;
  percentages: AudiencePercentages | null;
}

/**
 * Audience voting percentages (must sum to 100)
 */
interface AudiencePercentages {
  A: number;
  B: number;
  C: number;
  D: number;
}

/**
 * Phone a Friend lifeline state
 */
interface PhoneFriendState {
  used: boolean;
  suggestion: string | null;
  timer: TimerState | null;
}

/**
 * Lifeline type discriminator
 */
type LifelineType = 'fiftyFifty' | 'askAudience' | 'phoneFriend';
```

---

## Timer

```typescript
/**
 * Countdown timer state (question timer or phone a friend timer)
 */
interface TimerState {
  durationSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isExpired: boolean;
}
```

---

## Sync Events

```typescript
/**
 * Discriminated union of all sync event types
 * Used for BroadcastChannel communication
 */
type SyncEvent =
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
  | SyncEventGameEnded
  ;

/**
 * Base event structure
 */
interface BaseSyncEvent {
  type: string;
  timestamp: number;
}

/**
 * Seat requests full state sync
 */
interface SyncEventStateSyncRequest extends BaseSyncEvent {
  type: 'STATE_SYNC_REQUEST';
  payload: null;
}

/**
 * Host sends full state snapshot
 */
interface SyncEventStateSyncResponse extends BaseSyncEvent {
  type: 'STATE_SYNC_RESPONSE';
  payload: GameState;
}

/**
 * Host started a new question
 */
interface SyncEventQuestionStarted extends BaseSyncEvent {
  type: 'QUESTION_STARTED';
  payload: {
    question: Question;
  };
}

/**
 * Host selected a choice (before locking)
 */
interface SyncEventChoiceSelected extends BaseSyncEvent {
  type: 'CHOICE_SELECTED';
  payload: {
    choice: ChoiceKey;
  };
}

/**
 * Host locked final answer
 */
interface SyncEventFinalLocked extends BaseSyncEvent {
  type: 'FINAL_LOCKED';
  payload: {
    choice: ChoiceKey;
  };
}

/**
 * Host revealed correct answer
 */
interface SyncEventRevealShown extends BaseSyncEvent {
  type: 'REVEAL_SHOWN';
  payload: {
    correct: boolean;
    correctAnswer: ChoiceKey;
  };
}

/**
 * Host advanced to next level
 */
interface SyncEventLevelAdvanced extends BaseSyncEvent {
  type: 'LEVEL_ADVANCED';
  payload: {
    level: number;
    clearedLevel: number;
  };
}

/**
 * Host activated a lifeline
 */
interface SyncEventLifelineUsed extends BaseSyncEvent {
  type: 'LIFELINE_USED';
  payload: {
    type: LifelineType;
    data: FiftyFiftyData | AskAudienceData | PhoneFriendData;
  };
}

/**
 * Lifeline activation data types
 */
interface FiftyFiftyData {
  removedChoices: ChoiceKey[];
}

interface AskAudienceData {
  percentages: AudiencePercentages;
}

interface PhoneFriendData {
  suggestion: string | null;
  timerStarted: boolean;
}

/**
 * Timer ticked (1/second)
 */
interface SyncEventTimerTick extends BaseSyncEvent {
  type: 'TIMER_TICK';
  payload: {
    remaining: number;
  };
}

/**
 * Timer reached zero
 */
interface SyncEventTimerExpired extends BaseSyncEvent {
  type: 'TIMER_EXPIRED';
  payload: null;
}

/**
 * Contestant walked away
 */
interface SyncEventWalkAway extends BaseSyncEvent {
  type: 'WALK_AWAY';
  payload: {
    winnings: number;
  };
}

/**
 * Game ended (win/lose/walkaway)
 */
interface SyncEventGameEnded extends BaseSyncEvent {
  type: 'GAME_ENDED';
  payload: {
    winnings: number;
    walkAway: boolean;
    reason: 'win' | 'lose' | 'walkaway';
  };
}
```

---

## Helper Functions

```typescript
/**
 * Calculate winnings based on game state
 */
function calculateWinnings(gameState: GameState): number {
  if (gameState.walkAway) {
    // Walk away: get last cleared level value
    return gameState.clearedLevel > 0
      ? gameState.ladder.levels[gameState.clearedLevel - 1].value
      : 0;
  }
  
  // Incorrect answer: get last safe haven value
  const safeHavens = gameState.ladder.safeHavens.sort((a, b) => b - a);
  const lastSafeHaven = safeHavens.find(sh => sh <= gameState.clearedLevel) || 0;
  return lastSafeHaven > 0
    ? gameState.ladder.levels[lastSafeHaven - 1].value
    : 0;
}

/**
 * Create default game state
 */
function createDefaultGameState(): GameState {
  return {
    gameId: crypto.randomUUID(),
    phase: GamePhase.SETUP,
    contestantName: null,
    currentLevel: 1,
    clearedLevel: 0,
    currentQuestion: null,
    selectedChoice: null,
    finalAnswer: null,
    correctAnswer: null,
    ladder: createDefaultLadder(),
    lifelines: createDefaultLifelines(),
    questionPack: null,
    questionTimer: null,
    finalWinnings: 0,
    walkAway: false
  };
}

/**
 * Create default money ladder (classic game show)
 */
function createDefaultLadder(): MoneyLadder {
  return {
    levels: [
      { levelNumber: 1, value: 100 },
      { levelNumber: 2, value: 200 },
      { levelNumber: 3, value: 300 },
      { levelNumber: 4, value: 500 },
      { levelNumber: 5, value: 1000 },
      { levelNumber: 6, value: 2000 },
      { levelNumber: 7, value: 4000 },
      { levelNumber: 8, value: 8000 },
      { levelNumber: 9, value: 16000 },
      { levelNumber: 10, value: 32000 },
      { levelNumber: 11, value: 64000 },
      { levelNumber: 12, value: 125000 },
      { levelNumber: 13, value: 250000 },
      { levelNumber: 14, value: 500000 },
      { levelNumber: 15, value: 1000000 }
    ],
    safeHavens: [5, 10]
  };
}

/**
 * Create default lifeline state (all available)
 */
function createDefaultLifelines(): LifelineState {
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

/**
 * Type guard for sync events
 */
function isSyncEvent(data: any): data is SyncEvent {
  return data && typeof data === 'object' && 'type' in data && 'timestamp' in data;
}
```

---

## Zod Schemas (for Runtime Validation)

```typescript
import { z } from 'zod';

/**
 * Zod schema for Choice
 */
const ChoiceSchema = z.object({
  key: z.enum(['A', 'B', 'C', 'D']),
  text: z.string().min(1).max(200)
});

/**
 * Zod schema for Question
 */
const QuestionSchema = z.object({
  id: z.string(),
  level: z.number().int().min(1).max(15),
  text: z.string().min(10).max(500),
  choices: z.array(ChoiceSchema).length(4),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']),
  category: z.string().max(50).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  explanation: z.string().max(1000).optional(),
  mediaUrl: z.string().url().optional()
}).refine(
  (q) => q.choices.some((c) => c.key === q.correctAnswer),
  { message: 'Correct answer must exist in choices' }
).refine(
  (q) => {
    const keys = q.choices.map(c => c.key);
    return new Set(keys).size === 4;
  },
  { message: 'All choice keys must be unique' }
);

/**
 * Zod schema for QuestionPack
 */
const QuestionPackSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  creator: z.string().max(100).optional(),
  questions: z.array(QuestionSchema).min(1).max(15)
}).refine(
  (pack) => {
    const levels = pack.questions.map((q) => q.level).sort((a, b) => a - b);
    const expected = Array.from({ length: levels.length }, (_, i) => i + 1);
    return JSON.stringify(levels) === JSON.stringify(expected);
  },
  { message: 'Question levels must be contiguous from 1 to N' }
);

/**
 * Zod schema for AudiencePercentages
 */
const AudiencePercentagesSchema = z.object({
  A: z.number().min(0).max(100),
  B: z.number().min(0).max(100),
  C: z.number().min(0).max(100),
  D: z.number().min(0).max(100)
}).refine(
  (p) => Math.abs((p.A + p.B + p.C + p.D) - 100) < 0.01,
  { message: 'Percentages must sum to exactly 100' }
);
```

---

## Usage Example

```typescript
// Import interfaces
import { GameState, Question, SyncEvent } from './models';

// Create default game state
const gameState: GameState = createDefaultGameState();

// Validate imported question pack
import { QuestionPackSchema } from './models/validation';

try {
  const pack = QuestionPackSchema.parse(importedJson);
  console.log('Valid question pack:', pack);
} catch (error) {
  console.error('Invalid question pack:', error.errors);
}

// Handle sync event with type safety
function handleSyncEvent(event: SyncEvent): void {
  switch (event.type) {
    case 'QUESTION_STARTED':
      // TypeScript knows event.payload has { question: Question }
      displayQuestion(event.payload.question);
      break;
      
    case 'FINAL_LOCKED':
      // TypeScript knows event.payload has { choice: ChoiceKey }
      lockAnswer(event.payload.choice);
      break;
      
    // ... other cases
  }
}
```

---

**Phase 1 Contracts Complete**: All TypeScript interfaces defined.
