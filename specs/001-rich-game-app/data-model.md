# Data Model: Who Wants to Be Rich Game Application

**Date**: 2025-12-14  
**Feature**: 001-rich-game-app

## Purpose

This document defines all data entities, their fields, relationships, validation rules, and state transitions for the game application. These models form the foundation for TypeScript interfaces and drive the implementation of game logic and synchronization.

---

## Entity Definitions

### 1. GameState

**Description**: Root state object representing the complete current state of a game session. Single source of truth owned by the host, synchronized to seat display.

**Fields**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `gameId` | `string` | Yes | `uuid()` | Unique identifier for this game session |
| `phase` | `GamePhase` | Yes | `SETUP` | Current phase of game flow |
| `contestantName` | `string` | No | `null` | Contestant's display name |
| `currentLevel` | `number` | Yes | `1` | Current level (1-15) contestant is attempting |
| `clearedLevel` | `number` | Yes | `0` | Highest level successfully cleared (0 = none) |
| `currentQuestion` | `Question \| null` | Yes | `null` | Currently displayed question |
| `selectedChoice` | `ChoiceKey \| null` | Yes | `null` | Choice contestant has selected (not locked) |
| `finalAnswer` | `ChoiceKey \| null` | Yes | `null` | Final locked answer choice |
| `correctAnswer` | `ChoiceKey \| null` | Yes | `null` | Correct answer (revealed after lock) |
| `ladder` | `MoneyLadder` | Yes | default | Money ladder configuration |
| `lifelines` | `LifelineState` | Yes | default | State of all three lifelines |
| `questionPack` | `QuestionPack \| null` | Yes | `null` | Loaded question pack |
| `questionTimer` | `TimerState \| null` | Yes | `null` | Question countdown timer state |
| `finalWinnings` | `number` | Yes | `0` | Final amount won when game ends |
| `walkAway` | `boolean` | Yes | `false` | True if contestant walked away |

**Relationships**:
- Contains one `MoneyLadder` (embedded)
- Contains one `LifelineState` (embedded)
- References one `QuestionPack`
- References one `Question` (current)

**Validation Rules**:
- `currentLevel` must be between 1 and 15
- `clearedLevel` must be between 0 and 15
- `clearedLevel` must be less than or equal to `currentLevel`
- `finalAnswer` can only be set if `selectedChoice` is set
- `correctAnswer` should only be populated after reveal (not visible to contestant until reveal)

**State Transitions**: See GamePhase section below

---

### 2. GamePhase

**Description**: Enumeration of game flow phases that control UI state and available actions.

**Values**:

| Value | Description | Valid Transitions |
|-------|-------------|-------------------|
| `SETUP` | Initial state before game starts; host configuring settings | → `QUESTION` |
| `QUESTION` | Question displayed, contestant can select answer, lifelines available | → `FINAL_LOCKED`, `WALK_AWAY`, `SETUP` (reset) |
| `FINAL_LOCKED` | Final answer has been locked, reveal pending | → `REVEAL` |
| `REVEAL` | Revealing correct answer and outcome | → `BETWEEN`, `ENDED` |
| `BETWEEN` | Between questions, showing cleared level | → `QUESTION`, `ENDED` |
| `ENDED` | Game finished (win, lose, or walk away) | → `SETUP` (new game) |

**Transition Rules**:
- `SETUP → QUESTION`: When host starts first question (requires question pack loaded)
- `QUESTION → FINAL_LOCKED`: When host locks final answer (requires `selectedChoice` set)
- `QUESTION → WALK_AWAY`: When host triggers walk away (requires `clearedLevel > 0`)
- `FINAL_LOCKED → REVEAL`: When host triggers reveal
- `REVEAL → BETWEEN`: When reveal completes and answer was correct (level < 15)
- `REVEAL → ENDED`: When reveal completes and (answer incorrect OR level = 15)
- `BETWEEN → QUESTION`: When host starts next question
- `ENDED → SETUP`: When host starts new game (resets state)

---

### 3. Question

**Description**: A single trivia question with four answer choices, correct answer key, and metadata.

**Fields**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | `string` | Yes | - | Unique identifier for question |
| `level` | `number` | Yes | - | Associated level (1-15) |
| `text` | `string` | Yes | - | Question text (displayed to contestant) |
| `choices` | `Choice[]` | Yes | - | Array of 4 choices (A, B, C, D) |
| `correctAnswer` | `ChoiceKey` | Yes | - | Key of correct answer ('A', 'B', 'C', or 'D') |
| `category` | `string` | No | `null` | Optional category (e.g., "History", "Science") |
| `difficulty` | `Difficulty` | No | `null` | Optional difficulty rating |
| `explanation` | `string` | No | `null` | Optional host-only explanation text |
| `mediaUrl` | `string` | No | `null` | Optional media URL (http/https/file://) |

**Relationships**:
- Contains 4 `Choice` objects (embedded)
- Belongs to one `QuestionPack`

**Validation Rules**:
- `text` must be at least 10 characters
- `choices` must contain exactly 4 elements
- `choices` must have unique keys (A, B, C, D)
- `correctAnswer` must exist in `choices` as a key
- `level` must be between 1 and 15
- `mediaUrl` if present must be valid URL format

---

### 4. Choice

**Description**: A single answer choice for a question.

**Fields**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `key` | `ChoiceKey` | Yes | - | Choice identifier ('A', 'B', 'C', or 'D') |
| `text` | `string` | Yes | - | Choice text displayed to contestant |

**Validation Rules**:
- `key` must be one of: 'A', 'B', 'C', 'D'
- `text` must be at least 1 character
- Within a question, no two choices can have the same `key`

---

### 5. ChoiceKey

**Description**: Type alias for valid answer choice keys.

**Definition**: `type ChoiceKey = 'A' | 'B' | 'C' | 'D'`

---

### 6. Difficulty

**Description**: Enumeration of question difficulty levels (optional metadata).

**Values**: `'easy' | 'medium' | 'hard'`

---

### 7. QuestionPack

**Description**: A collection of questions with metadata, imported from JSON.

**Fields**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | `string` | Yes | `uuid()` | Unique identifier for pack (generated) |
| `name` | `string` | Yes | - | Display name of question pack |
| `description` | `string` | No | `null` | Optional description |
| `creator` | `string` | No | `null` | Optional creator name |
| `questions` | `Question[]` | Yes | - | Array of 1-15 questions |

**Relationships**:
- Contains 1-15 `Question` objects

**Validation Rules**:
- `questions` must contain at least 1 question and at most 15
- `questions[].level` values must be contiguous starting from 1 (e.g., 1,2,3...N)
- Each level from 1 to N must have exactly one question
- All questions must pass individual `Question` validation

---

### 8. MoneyLadder

**Description**: Configuration of prize values and safe haven positions for the 15-level ladder.

**Fields**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `levels` | `LadderLevel[]` | Yes | classic | Array of 15 ladder levels |
| `safeHavens` | `number[]` | Yes | `[5, 10]` | Level numbers designated as safe havens |

**Relationships**:
- Contains 15 `LadderLevel` objects

**Validation Rules**:
- `levels` must contain exactly 15 elements
- `levels[i].levelNumber` must equal `i + 1` (contiguous)
- `levels[i].value` must be positive integer
- `levels` values should be monotonically increasing (warning, not error)
- `safeHavens` must contain level numbers that exist in `levels`
- `safeHavens` should be sorted ascending

**Default Configuration** (classic game show):
```typescript
[
  { levelNumber: 1, value: 100 },
  { levelNumber: 2, value: 200 },
  { levelNumber: 3, value: 300 },
  { levelNumber: 4, value: 500 },
  { levelNumber: 5, value: 1000 },     // Safe haven
  { levelNumber: 6, value: 2000 },
  { levelNumber: 7, value: 4000 },
  { levelNumber: 8, value: 8000 },
  { levelNumber: 9, value: 16000 },
  { levelNumber: 10, value: 32000 },   // Safe haven
  { levelNumber: 11, value: 64000 },
  { levelNumber: 12, value: 125000 },
  { levelNumber: 13, value: 250000 },
  { levelNumber: 14, value: 500000 },
  { levelNumber: 15, value: 1000000 }
]
```

---

### 9. LadderLevel

**Description**: A single level in the money ladder with its prize value.

**Fields**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `levelNumber` | `number` | Yes | - | Level number (1-15) |
| `value` | `number` | Yes | - | Prize value for this level (e.g., 1000 = $1,000) |

**Validation Rules**:
- `levelNumber` must be between 1 and 15
- `value` must be positive integer

---

### 10. LifelineState

**Description**: State of all three lifelines for the current game.

**Fields**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `fiftyFifty` | `FiftyFiftyState` | Yes | default | 50:50 lifeline state |
| `askAudience` | `AskAudienceState` | Yes | default | Ask the Audience lifeline state |
| `phoneFriend` | `PhoneFriendState` | Yes | default | Phone a Friend lifeline state |

**Relationships**:
- Contains one state object for each lifeline type

---

### 11. FiftyFiftyState

**Description**: State of the 50:50 lifeline.

**Fields**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `used` | `boolean` | Yes | `false` | True if lifeline has been used |
| `removedChoices` | `ChoiceKey[]` | Yes | `[]` | Choices removed when lifeline activated |

**Validation Rules**:
- `removedChoices` must contain exactly 0 or 2 elements
- If `used` is true, `removedChoices` must have 2 elements
- `removedChoices` must not include the correct answer

**State Transitions**:
- Available (not used) → Activated (used, 2 choices removed) → Used (remains used)

---

### 12. AskAudienceState

**Description**: State of the Ask the Audience lifeline.

**Fields**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `used` | `boolean` | Yes | `false` | True if lifeline has been used |
| `percentages` | `AudiencePercentages \| null` | Yes | `null` | Audience vote percentages by choice |

**Validation Rules**:
- If `used` is true, `percentages` must be populated
- Percentages must sum to exactly 100

---

### 13. AudiencePercentages

**Description**: Audience voting percentages for each answer choice.

**Fields**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `A` | `number` | Yes | - | Percentage for choice A (0-100) |
| `B` | `number` | Yes | - | Percentage for choice B (0-100) |
| `C` | `number` | Yes | - | Percentage for choice C (0-100) |
| `D` | `number` | Yes | - | Percentage for choice D (0-100) |

**Validation Rules**:
- Each field must be between 0 and 100
- Sum of A + B + C + D must equal exactly 100
- Values can be integers or decimals (e.g., 33.3)

---

### 14. PhoneFriendState

**Description**: State of the Phone a Friend lifeline.

**Fields**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `used` | `boolean` | Yes | `false` | True if lifeline has been used |
| `suggestion` | `string \| null` | Yes | `null` | Friend's suggestion text entered by host |
| `timer` | `TimerState \| null` | Yes | `null` | Optional countdown timer for phone call |

**Validation Rules**:
- If `used` is true, `suggestion` may or may not be populated (host can use without entering suggestion)

---

### 15. TimerState

**Description**: State of a countdown timer (question timer or phone a friend timer).

**Fields**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `durationSeconds` | `number` | Yes | - | Original duration in seconds |
| `remainingSeconds` | `number` | Yes | - | Current remaining seconds |
| `isRunning` | `boolean` | Yes | `true` | True if timer is actively counting down |
| `isExpired` | `boolean` | Yes | `false` | True if timer reached zero |

**Validation Rules**:
- `durationSeconds` must be positive integer
- `remainingSeconds` must be between 0 and `durationSeconds`
- If `isExpired` is true, `remainingSeconds` must be 0
- If `isExpired` is true, `isRunning` must be false

**State Transitions**:
- Created (running, not expired) → Paused (not running, not expired) → Resumed (running, not expired) → Expired (not running, expired)
- Can reset to initial state (remainingSeconds = durationSeconds, running, not expired)

---

### 16. SyncEvent

**Description**: Messages passed between host and seat displays via BroadcastChannel for state synchronization.

**Type**: Discriminated union of event types

**Event Types**:

| Event Type | Direction | Payload | Description |
|------------|-----------|---------|-------------|
| `STATE_SYNC_REQUEST` | Seat → Host | `null` | Seat requests full state snapshot |
| `STATE_SYNC_RESPONSE` | Host → Seat | `GameState` | Host sends full current state |
| `QUESTION_STARTED` | Host → Seat | `{ question: Question }` | New question displayed |
| `CHOICE_SELECTED` | Host → Seat | `{ choice: ChoiceKey }` | Contestant selected a choice |
| `FINAL_LOCKED` | Host → Seat | `{ choice: ChoiceKey }` | Final answer locked |
| `REVEAL_SHOWN` | Host → Seat | `{ correct: boolean }` | Reveal sequence triggered |
| `LIFELINE_USED` | Host → Seat | `{ type: LifelineType, data: any }` | Lifeline activated |
| `TIMER_TICK` | Host → Seat | `{ remaining: number }` | Timer updated (1/sec) |
| `TIMER_EXPIRED` | Host → Seat | `null` | Timer reached zero |
| `GAME_ENDED` | Host → Seat | `{ winnings: number, walkAway: boolean }` | Game finished |
| `WALK_AWAY` | Host → Seat | `{ winnings: number }` | Contestant walked away |
| `LEVEL_ADVANCED` | Host → Seat | `{ level: number }` | Moved to next level |

**Common Fields** (all events):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `SyncEventType` | Yes | Event type discriminator |
| `payload` | `any` | Yes | Event-specific payload (typed by event type) |
| `timestamp` | `number` | Yes | Unix timestamp (ms) of event creation |

**TypeScript Definition**:
```typescript
type SyncEvent =
  | { type: 'STATE_SYNC_REQUEST'; payload: null; timestamp: number }
  | { type: 'STATE_SYNC_RESPONSE'; payload: GameState; timestamp: number }
  | { type: 'QUESTION_STARTED'; payload: { question: Question }; timestamp: number }
  | { type: 'CHOICE_SELECTED'; payload: { choice: ChoiceKey }; timestamp: number }
  | { type: 'FINAL_LOCKED'; payload: { choice: ChoiceKey }; timestamp: number }
  | { type: 'REVEAL_SHOWN'; payload: { correct: boolean }; timestamp: number }
  | { type: 'LIFELINE_USED'; payload: { type: LifelineType; data: any }; timestamp: number }
  | { type: 'TIMER_TICK'; payload: { remaining: number }; timestamp: number }
  | { type: 'TIMER_EXPIRED'; payload: null; timestamp: number }
  | { type: 'GAME_ENDED'; payload: { winnings: number; walkAway: boolean }; timestamp: number }
  | { type: 'WALK_AWAY'; payload: { winnings: number }; timestamp: number }
  | { type: 'LEVEL_ADVANCED'; payload: { level: number }; timestamp: number }
  ;
```

---

### 17. LifelineType

**Description**: Enumeration of lifeline types.

**Values**: `'fiftyFifty' | 'askAudience' | 'phoneFriend'`

---

## Entity Relationship Diagram (Textual)

```
GameState
├── phase: GamePhase (enum)
├── currentQuestion: Question?
│   └── choices: Choice[4]
│       └── key: ChoiceKey (A|B|C|D)
├── ladder: MoneyLadder
│   ├── levels: LadderLevel[15]
│   └── safeHavens: number[]
├── lifelines: LifelineState
│   ├── fiftyFifty: FiftyFiftyState
│   ├── askAudience: AskAudienceState
│   │   └── percentages: AudiencePercentages?
│   └── phoneFriend: PhoneFriendState
│       └── timer: TimerState?
├── questionPack: QuestionPack?
│   └── questions: Question[1-15]
└── questionTimer: TimerState?

SyncEvent (discriminated union)
├── type: SyncEventType
├── payload: <varies by type>
└── timestamp: number
```

---

## Validation Summary

| Entity | Critical Validations | Warnings |
|--------|---------------------|----------|
| `GameState` | currentLevel (1-15), clearedLevel <= currentLevel | - |
| `Question` | 4 unique choices, correctAnswer exists in choices, text min 10 chars | level not contiguous |
| `QuestionPack` | 1-15 questions, contiguous levels | - |
| `MoneyLadder` | 15 levels, positive values | values not increasing |
| `AudiencePercentages` | Sum equals 100 | - |
| `FiftyFiftyState` | removedChoices count = 2 if used, not correct answer | - |
| `TimerState` | remainingSeconds <= durationSeconds | - |

---

## State Machine: GamePhase Transitions

```
        ┌─────────┐
   ┌───▶│  SETUP  │◀───────────────┐
   │    └─────────┘                │
   │         │                     │
   │         │ start question      │ new game
   │         ▼                     │
   │    ┌──────────┐               │
   │    │ QUESTION │               │
   │    └──────────┘               │
   │         │  │                  │
   │   lock  │  │ walk away        │
   │    ┌────┘  └─────┐            │
   │    ▼              ▼            │
   │ ┌──────────────┐ ┌────────┐   │
   │ │ FINAL_LOCKED │ │ ENDED  │───┘
   │ └──────────────┘ └────────┘
   │         │             ▲
   │  reveal │             │
   │         ▼             │
   │    ┌────────┐         │
   │    │ REVEAL │─────────┤ incorrect or level 15
   │    └────────┘         │
   │         │             │
   │ correct │             │
   │  (< 15) │             │
   │         ▼             │
   │   ┌─────────┐         │
   └───│ BETWEEN │         │
       └─────────┘         │
            │              │
    next Q  │              │
            └──────────────┘ level 15 cleared
```

---

## Winnings Calculation Logic

**Scenario 1: Correct Answer**
- Contestant advances to next level
- Cleared level becomes current level
- Current level increments by 1
- If level 15 cleared, game ends with $1M (max prize)

**Scenario 2: Incorrect Answer**
- Game ends
- Winnings = last safe haven cleared
  - If clearedLevel < first safe haven (5): winnings = 0
  - If clearedLevel >= 5 and < 10: winnings = level 5 value ($1,000)
  - If clearedLevel >= 10: winnings = level 10 value ($32,000)

**Scenario 3: Walk Away**
- Game ends
- Winnings = last cleared level value
  - If clearedLevel = 0: winnings = 0 (walked away without answering anything)
  - Otherwise: winnings = ladder.levels[clearedLevel - 1].value

**Implementation Formula**:
```typescript
function calculateWinnings(gameState: GameState): number {
  if (gameState.walkAway) {
    // Walk away: get last cleared level value
    return gameState.clearedLevel > 0
      ? gameState.ladder.levels[gameState.clearedLevel - 1].value
      : 0;
  }
  
  // Incorrect answer: get last safe haven value
  const safeHavens = gameState.ladder.safeHavens.sort((a, b) => b - a); // Descending
  const lastSafeHaven = safeHavens.find(sh => sh <= gameState.clearedLevel) || 0;
  return lastSafeHaven > 0
    ? gameState.ladder.levels[lastSafeHaven - 1].value
    : 0;
}
```

---

## TypeScript Implementation Notes

All entities should be defined as TypeScript interfaces (for data shapes) or types (for unions/aliases). Use `readonly` modifiers for immutable fields where appropriate (e.g., `readonly id: string`).

Example:
```typescript
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

enum GamePhase {
  SETUP = 'SETUP',
  QUESTION = 'QUESTION',
  FINAL_LOCKED = 'FINAL_LOCKED',
  REVEAL = 'REVEAL',
  BETWEEN = 'BETWEEN',
  ENDED = 'ENDED'
}

type ChoiceKey = 'A' | 'B' | 'C' | 'D';
```

Use Zod schemas (see research.md) for runtime validation of imported JSON data.

---

**Phase 1 Data Model Complete**: All entities, relationships, validation rules, and state transitions defined. Ready to generate API contracts and quickstart guide.
