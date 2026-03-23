# BroadcastChannel Sync Event Protocol

**Version**: 1.0.0  
**Date**: 2025-12-14

## Overview

This document defines the message protocol for synchronizing game state between the Host UI (`/host`) and Seat UI (`/seat`) using the BroadcastChannel API.

**Channel Name**: `rich-game`

**Message Format**: JSON objects with `type`, `payload`, and `timestamp` fields

**Direction**:
- **Host → Seat**: All game state mutations
- **Seat → Host**: State sync requests only
- **Broadcast**: Host broadcasts to all listeners (including other potential host tabs, though only one should be active)

---

## Message Structure

All messages conform to this base structure:

```typescript
interface SyncMessage {
  type: string;           // Event type discriminator
  payload: any;           // Event-specific data (see event definitions)
  timestamp: number;      // Unix timestamp in milliseconds (Date.now())
}
```

---

## Event Types

### 1. STATE_SYNC_REQUEST

**Direction**: Seat → Host  
**Trigger**: Seat display loads or reconnects  
**Purpose**: Request full current game state snapshot

**Payload**: `null`

**Example**:
```json
{
  "type": "STATE_SYNC_REQUEST",
  "payload": null,
  "timestamp": 1702598400000
}
```

**Host Response**: Responds with `STATE_SYNC_RESPONSE`

---

### 2. STATE_SYNC_RESPONSE

**Direction**: Host → Seat  
**Trigger**: Host receives `STATE_SYNC_REQUEST` or seat reconnects  
**Purpose**: Send complete current game state to seat

**Payload**: Full `GameState` object (see data-model.md)

**Example**:
```json
{
  "type": "STATE_SYNC_RESPONSE",
  "payload": {
    "gameId": "uuid-123",
    "phase": "QUESTION",
    "contestantName": "John Doe",
    "currentLevel": 5,
    "clearedLevel": 4,
    "currentQuestion": { "id": "q5", "level": 5, "text": "...", "choices": [...], "correctAnswer": "B" },
    "selectedChoice": null,
    "finalAnswer": null,
    "correctAnswer": null,
    "ladder": { "levels": [...], "safeHavens": [5, 10] },
    "lifelines": { "fiftyFifty": { "used": false, "removedChoices": [] }, ... },
    "questionPack": { "id": "pack-1", "name": "General Knowledge", "questions": [...] },
    "questionTimer": null,
    "finalWinnings": 0,
    "walkAway": false
  },
  "timestamp": 1702598400100
}
```

**Note**: The `correctAnswer` field should remain `null` until reveal to prevent premature disclosure on seat display.

---

### 3. QUESTION_STARTED

**Direction**: Host → Seat  
**Trigger**: Host starts a new question  
**Purpose**: Display question on seat

**Payload**:
```typescript
{
  question: Question;     // Full question object (without correctAnswer visible yet)
}
```

**Example**:
```json
{
  "type": "QUESTION_STARTED",
  "payload": {
    "question": {
      "id": "q5",
      "level": 5,
      "text": "What is the largest planet in our solar system?",
      "choices": [
        { "key": "A", "text": "Earth" },
        { "key": "B", "text": "Jupiter" },
        { "key": "C", "text": "Saturn" },
        { "key": "D", "text": "Mars" }
      ],
      "category": "Science"
    }
  },
  "timestamp": 1702598450000
}
```

---

### 4. CHOICE_SELECTED

**Direction**: Host → Seat  
**Trigger**: Host selects a choice for contestant (before locking final answer)  
**Purpose**: Highlight selected choice on seat

**Payload**:
```typescript
{
  choice: ChoiceKey;      // 'A', 'B', 'C', or 'D'
}
```

**Example**:
```json
{
  "type": "CHOICE_SELECTED",
  "payload": {
    "choice": "B"
  },
  "timestamp": 1702598460000
}
```

**Note**: Selection can change multiple times before final lock.

---

### 5. FINAL_LOCKED

**Direction**: Host → Seat  
**Trigger**: Host locks final answer  
**Purpose**: Show "Final Answer" locked state on seat

**Payload**:
```typescript
{
  choice: ChoiceKey;      // Final locked answer choice
}
```

**Example**:
```json
{
  "type": "FINAL_LOCKED",
  "payload": {
    "choice": "B"
  },
  "timestamp": 1702598470000
}
```

**UI Impact**: Seat shows dramatic "Final Answer?" treatment, no more changes possible.

---

### 6. REVEAL_SHOWN

**Direction**: Host → Seat  
**Trigger**: Host triggers reveal sequence  
**Purpose**: Reveal correct answer and show outcome

**Payload**:
```typescript
{
  correct: boolean;       // True if final answer was correct
  correctAnswer: ChoiceKey; // The actual correct answer
}
```

**Example**:
```json
{
  "type": "REVEAL_SHOWN",
  "payload": {
    "correct": true,
    "correctAnswer": "B"
  },
  "timestamp": 1702598480000
}
```

**UI Impact**: Seat plays reveal animation (highlight correct answer green, if incorrect also show locked answer red).

---

### 7. LEVEL_ADVANCED

**Direction**: Host → Seat  
**Trigger**: Host advances to next level after correct answer  
**Purpose**: Update ladder display

**Payload**:
```typescript
{
  level: number;          // New current level (1-15)
  clearedLevel: number;   // Updated cleared level
}
```

**Example**:
```json
{
  "type": "LEVEL_ADVANCED",
  "payload": {
    "level": 6,
    "clearedLevel": 5
  },
  "timestamp": 1702598490000
}
```

**UI Impact**: Seat animates ladder climb to new level.

---

### 8. LIFELINE_USED

**Direction**: Host → Seat  
**Trigger**: Host activates a lifeline  
**Purpose**: Update lifeline status and show lifeline result

**Payload**:
```typescript
{
  type: LifelineType;     // 'fiftyFifty' | 'askAudience' | 'phoneFriend'
  data: any;              // Lifeline-specific data (see subtypes below)
}
```

**Subtypes**:

#### 8a. 50:50 Lifeline
```json
{
  "type": "LIFELINE_USED",
  "payload": {
    "type": "fiftyFifty",
    "data": {
      "removedChoices": ["A", "D"]
    }
  },
  "timestamp": 1702598500000
}
```

**UI Impact**: Seat grays out removed choices.

#### 8b. Ask the Audience Lifeline
```json
{
  "type": "LIFELINE_USED",
  "payload": {
    "type": "askAudience",
    "data": {
      "percentages": {
        "A": 10,
        "B": 60,
        "C": 20,
        "D": 10
      }
    }
  },
  "timestamp": 1702598510000
}
```

**UI Impact**: Seat displays bar chart with percentages.

#### 8c. Phone a Friend Lifeline
```json
{
  "type": "LIFELINE_USED",
  "payload": {
    "type": "phoneFriend",
    "data": {
      "suggestion": "I think it's B, Jupiter",
      "timerStarted": true
    }
  },
  "timestamp": 1702598520000
}
```

**UI Impact**: Seat shows "Phone a Friend" active, suggestion text, and timer if started.

---

### 9. TIMER_TICK

**Direction**: Host → Seat  
**Trigger**: Every second while timer is running  
**Purpose**: Update countdown timer display

**Payload**:
```typescript
{
  remaining: number;      // Remaining seconds
}
```

**Example**:
```json
{
  "type": "TIMER_TICK",
  "payload": {
    "remaining": 45
  },
  "timestamp": 1702598530000
}
```

**Frequency**: Once per second while timer active.

---

### 10. TIMER_EXPIRED

**Direction**: Host → Seat  
**Trigger**: Timer reaches zero  
**Purpose**: Show "Time's Up" indicator

**Payload**: `null`

**Example**:
```json
{
  "type": "TIMER_EXPIRED",
  "payload": null,
  "timestamp": 1702598575000
}
```

**UI Impact**: Seat shows "Time's Up" message (game continues, no forced action).

---

### 11. WALK_AWAY

**Direction**: Host → Seat  
**Trigger**: Host triggers walk away  
**Purpose**: End game with contestant keeping cleared level winnings

**Payload**:
```typescript
{
  winnings: number;       // Final winnings amount
}
```

**Example**:
```json
{
  "type": "WALK_AWAY",
  "payload": {
    "winnings": 16000
  },
  "timestamp": 1702598600000
}
```

**UI Impact**: Seat shows "Walk Away" result screen with winnings.

---

### 12. GAME_ENDED

**Direction**: Host → Seat  
**Trigger**: Game ends (win, lose, or complete)  
**Purpose**: Show final results

**Payload**:
```typescript
{
  winnings: number;       // Final winnings amount
  walkAway: boolean;      // True if ended via walk away
  reason: string;         // 'win' | 'lose' | 'walkaway'
}
```

**Example (Win)**:
```json
{
  "type": "GAME_ENDED",
  "payload": {
    "winnings": 1000000,
    "walkAway": false,
    "reason": "win"
  },
  "timestamp": 1702598700000
}
```

**Example (Lose)**:
```json
{
  "type": "GAME_ENDED",
  "payload": {
    "winnings": 1000,
    "walkAway": false,
    "reason": "lose"
  },
  "timestamp": 1702598710000
}
```

**UI Impact**: Seat shows final results screen with dramatic presentation.

---

## Implementation Notes

### TypeScript Discriminated Union

All sync events should be typed as a discriminated union for type-safe handling:

```typescript
type SyncEvent =
  | { type: 'STATE_SYNC_REQUEST'; payload: null; timestamp: number }
  | { type: 'STATE_SYNC_RESPONSE'; payload: GameState; timestamp: number }
  | { type: 'QUESTION_STARTED'; payload: { question: Question }; timestamp: number }
  | { type: 'CHOICE_SELECTED'; payload: { choice: ChoiceKey }; timestamp: number }
  | { type: 'FINAL_LOCKED'; payload: { choice: ChoiceKey }; timestamp: number }
  | { type: 'REVEAL_SHOWN'; payload: { correct: boolean; correctAnswer: ChoiceKey }; timestamp: number }
  | { type: 'LEVEL_ADVANCED'; payload: { level: number; clearedLevel: number }; timestamp: number }
  | { type: 'LIFELINE_USED'; payload: { type: LifelineType; data: any }; timestamp: number }
  | { type: 'TIMER_TICK'; payload: { remaining: number }; timestamp: number }
  | { type: 'TIMER_EXPIRED'; payload: null; timestamp: number }
  | { type: 'WALK_AWAY'; payload: { winnings: number }; timestamp: number }
  | { type: 'GAME_ENDED'; payload: { winnings: number; walkAway: boolean; reason: string }; timestamp: number }
  ;
```

### Handling Events (Seat Side)

```typescript
const channel = new BroadcastChannel('rich-game');

channel.onmessage = (event: MessageEvent<SyncEvent>) => {
  const message = event.data;
  
  switch (message.type) {
    case 'STATE_SYNC_RESPONSE':
      this.gameState = message.payload;
      break;
      
    case 'QUESTION_STARTED':
      this.currentQuestion = message.payload.question;
      this.phase = 'QUESTION';
      break;
      
    case 'FINAL_LOCKED':
      this.finalAnswer = message.payload.choice;
      this.phase = 'FINAL_LOCKED';
      break;
      
    case 'REVEAL_SHOWN':
      this.revealCorrect = message.payload.correct;
      this.correctAnswer = message.payload.correctAnswer;
      this.phase = 'REVEAL';
      this.playRevealAnimation();
      break;
      
    // ... handle other event types
  }
};
```

### Sending Events (Host Side)

```typescript
const channel = new BroadcastChannel('rich-game');

function sendSyncEvent(type: string, payload: any): void {
  const message: SyncEvent = {
    type,
    payload,
    timestamp: Date.now()
  };
  channel.postMessage(message);
}

// Example: Start question
sendSyncEvent('QUESTION_STARTED', { question: currentQuestion });
```

### Error Handling

- **Invalid message format**: Log error, ignore message (don't crash)
- **Unknown event type**: Log warning, ignore message
- **BroadcastChannel not supported**: Show error to user (requires modern browser)

### Security

- **No authentication**: Same-origin policy enforced by BroadcastChannel
- **No encryption**: Messages are in-browser only (no network transmission)
- **Validation**: Host should validate own state changes; seat trusts host completely

---

## Protocol Versioning

**Current Version**: 1.0.0

Changes to this protocol should be versioned:
- **MAJOR**: Breaking changes to event structure (rename fields, remove events)
- **MINOR**: Additive changes (new optional fields, new event types)
- **PATCH**: Documentation updates only

Protocol version should be included in `STATE_SYNC_RESPONSE` payload if versioning becomes necessary.

---

**Phase 1 Contract Complete**: Sync event protocol fully defined.
