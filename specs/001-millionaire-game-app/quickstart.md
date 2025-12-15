# Quickstart Guide: Who Wants to Be a Millionaire Game Application

**Date**: 2025-12-14  
**Feature**: 001-millionaire-game-app  
**Target Audience**: Developers implementing this feature

## Overview

This guide provides a step-by-step implementation roadmap for building the "Who Wants to Be a Millionaire" game application. Follow this sequence to ensure proper layering of functionality from foundation to features.

---

## Prerequisites

- **Node.js**: v20+ (LTS)
- **npm**: v10+
- **Angular CLI**: v21+
- **TypeScript**: v5.9+
- **IDE**: VS Code recommended with Angular Language Service extension
- **Browser**: Chrome, Edge, Firefox, or Safari (latest version)

**Already Installed**:
- Angular 21 project scaffold exists at repository root
- Angular Material configured
- Basic routing configured (`/host` and `/seat` routes defined in `app.routes.ts`)

---

## Phase 0: Project Setup & Dependencies

### Step 0.1: Verify Angular Project Structure

```bash
# Ensure you're in project root
cd c:\Projects\WhoWantsToBeAMillionaire

# Verify Angular CLI version
ng version

# Should show Angular 21+
```

**Expected Output**: Angular CLI 21+, Angular Core 21+

### Step 0.2: Install Additional Dependencies

```bash
# Install ngx-layout for flexbox directives
npm install @ngbracket/ngx-layout

# Install Zod for schema validation
npm install zod

# Install Angular CDK if not already present (Material dependency)
npm install @angular/cdk
```

### Step 0.3: Verify TypeScript Configuration

Check `tsconfig.json` has strict mode enabled:

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true
    // ... other options
  }
}
```

### Step 0.4: Create Directory Structure

```bash
# Create model directories
mkdir src\app\models

# Create service directories
mkdir src\app\services

# Create component directories
mkdir src\app\host
mkdir src\app\seat
mkdir src\app\shared

# Create assets directory for sample data
mkdir public
```

---

## Phase 1: Core Models & Types

### Step 1.1: Implement Base Type Definitions

**File**: `src/app/models/choice-key.model.ts`

```typescript
export type ChoiceKey = 'A' | 'B' | 'C' | 'D';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type LifelineType = 'fiftyFifty' | 'askAudience' | 'phoneFriend';
```

### Step 1.2: Implement GamePhase Enum

**File**: `src/app/models/game-phase.model.ts`

```typescript
export enum GamePhase {
  SETUP = 'SETUP',
  QUESTION = 'QUESTION',
  FINAL_LOCKED = 'FINAL_LOCKED',
  REVEAL = 'REVEAL',
  BETWEEN = 'BETWEEN',
  ENDED = 'ENDED'
}
```

### Step 1.3: Implement Question Models

**File**: `src/app/models/question.model.ts`

See `contracts/typescript-interfaces.md` for complete definitions:
- `Choice`
- `Question`
- `QuestionPack`

### Step 1.4: Implement Money Ladder Models

**File**: `src/app/models/money-ladder.model.ts`

- `LadderLevel`
- `MoneyLadder`
- `createDefaultLadder()` function

### Step 1.5: Implement Lifeline Models

**File**: `src/app/models/lifeline.model.ts`

- `FiftyFiftyState`
- `AskAudienceState`
- `AudiencePercentages`
- `PhoneFriendState`
- `LifelineState`
- `createDefaultLifelines()` function

### Step 1.6: Implement Timer Model

**File**: `src/app/models/timer.model.ts`

- `TimerState`

### Step 1.7: Implement GameState Model

**File**: `src/app/models/game-state.model.ts`

- `GameState` (uses all previous models)
- `createDefaultGameState()` function
- `calculateWinnings()` function

### Step 1.8: Implement Sync Event Models

**File**: `src/app/models/sync-event.model.ts`

See `contracts/sync-event.protocol.md` for complete discriminated union definition.

---

## Phase 2: Core Services

### Step 2.1: Implement SyncService (BroadcastChannel)

**File**: `src/app/services/sync.service.ts`

**Responsibilities**:
- Create and manage BroadcastChannel instance
- Send sync events (host side)
- Receive sync events (seat side)
- Request state sync on seat load

**Key Methods**:
```typescript
@Injectable({ providedIn: 'root' })
export class SyncService {
  private channel: BroadcastChannel;
  public events$: Observable<SyncEvent>;
  
  constructor() {
    this.channel = new BroadcastChannel('millionaire-game');
    this.events$ = fromEvent<MessageEvent<SyncEvent>>(this.channel, 'message')
      .pipe(map(event => event.data));
  }
  
  sendEvent(event: SyncEvent): void;
  requestStateSync(): void;
  destroy(): void;
}
```

### Step 2.2: Implement GameStateService

**File**: `src/app/services/game-state.service.ts`

**Responsibilities**:
- Maintain current GameState (host only)
- Expose GameState as Observable
- Mutate state and emit sync events
- Persist state to sessionStorage

**Key Methods**:
```typescript
@Injectable({ providedIn: 'root' })
export class GameStateService {
  private stateSubject = new BehaviorSubject<GameState>(createDefaultGameState());
  public state$ = this.stateSubject.asObservable();
  
  constructor(private syncService: SyncService) {}
  
  startQuestion(question: Question): void;
  selectChoice(choice: ChoiceKey): void;
  lockFinalAnswer(): void;
  revealAnswer(): void;
  advanceLevel(): void;
  walkAway(): void;
  endGame(): void;
  useFiftyFifty(): void;
  useAskAudience(percentages: AudiencePercentages): void;
  usePhoneFriend(suggestion: string): void;
  resetGame(): void;
}
```

### Step 2.3: Implement QuestionPackService

**File**: `src/app/services/question-pack.service.ts`

**Responsibilities**:
- Load question packs from JSON
- Validate with Zod schema
- Store in localStorage
- List available packs

**Key Methods**:
```typescript
@Injectable({ providedIn: 'root' })
export class QuestionPackService {
  importPack(json: string): Promise<QuestionPack>;
  validatePack(data: any): ValidationResult;
  savePack(pack: QuestionPack): void;
  loadPack(id: string): QuestionPack | null;
  listPacks(): QuestionPack[];
  deletePack(id: string): void;
}
```

### Step 2.4: Implement LadderConfigService

**File**: `src/app/services/ladder-config.service.ts`

**Responsibilities**:
- Manage custom ladder configurations
- Persist to localStorage
- Provide default ladder

**Key Methods**:
```typescript
@Injectable({ providedIn: 'root' })
export class LadderConfigService {
  saveConfig(ladder: MoneyLadder): void;
  loadConfig(): MoneyLadder;
  resetToDefault(): MoneyLadder;
}
```

---

## Phase 3: Shared Components

### Step 3.1: Answer Choices Component

**File**: `src/app/shared/answer-choices/answer-choices.component.ts`

**Purpose**: Display 4 answer choices (A-D) with visual states

**Inputs**:
- `choices: Choice[]`
- `selectedChoice: ChoiceKey | null`
- `finalAnswer: ChoiceKey | null`
- `correctAnswer: ChoiceKey | null`
- `removedChoices: ChoiceKey[]`
- `readOnly: boolean`

**Outputs**:
- `choiceSelected: EventEmitter<ChoiceKey>`

**Visual States**:
- Neutral (default)
- Selected (highlighted, not locked)
- Locked (final answer)
- Removed (50:50, grayed out)
- Correct (green after reveal)
- Incorrect (red after reveal)

### Step 3.2: Timer Component

**File**: `src/app/shared/timer/timer.component.ts`

**Purpose**: Display countdown timer

**Inputs**:
- `timerState: TimerState | null`

**Display**: "MM:SS" format or "Time's Up!" when expired

### Step 3.3: Connection Status Component

**File**: `src/app/shared/connection-status/connection-status.component.ts`

**Purpose**: Show seat display connection status (host side)

**Inputs**:
- `connected: boolean`

**Display**: "Display: Connected" (green) or "Display: Disconnected" (red)

---

## Phase 4: Host UI Components

### Step 4.1: Host Layout Component

**File**: `src/app/host/host-layout.component.ts`

**Purpose**: Main host container, route component for `/host`

**Layout**:
- Top: Game setup bar (contestant name, pack selector)
- Left: Question control panel
- Center: Current question display
- Right: Money ladder + lifelines
- Bottom: Admin controls

### Step 4.2: Game Setup Component

**File**: `src/app/host/game-setup/game-setup.component.ts`

**Purpose**: Configure game before start

**Features**:
- Contestant name input
- Question pack selector (dropdown)
- Import question pack (file upload)
- Ladder configuration
- "Start Game" button
- "Open Seat Display" button (opens popup)

### Step 4.3: Question Control Component

**File**: `src/app/host/question-control/question-control.component.ts`

**Purpose**: Display current question and control answer flow

**Features**:
- Show question text
- Show answer choices (with selection)
- Show correct answer indicator (host only)
- "Lock Final Answer" button
- "Reveal" button
- "Next Question" button (after reveal)
- Show explanation text (host only)

### Step 4.4: Lifeline Control Component

**File**: `src/app/host/lifeline-control/lifeline-control.component.ts`

**Purpose**: Activate lifelines

**Features**:
- 50:50 button → activates immediately
- Ask Audience button → opens dialog to enter percentages
- Phone Friend button → opens dialog to enter suggestion, start timer
- Show used/available status

### Step 4.5: Host Ladder Component

**File**: `src/app/host/host-ladder/host-ladder.component.ts`

**Purpose**: Display money ladder (host view)

**Features**:
- List all 15 levels
- Highlight current level
- Mark cleared levels
- Indicate safe havens
- Show current winnings

### Step 4.6: Admin Panel Component

**File**: `src/app/host/admin-panel/admin-panel.component.ts`

**Purpose**: Admin overrides

**Features**:
- "Walk Away" button
- Override current level (dropdown)
- Reset lifelines checkboxes
- "End Game" button
- "Reset Game" button

---

## Phase 5: Seat UI Components

### Step 5.1: Seat Layout Component

**File**: `src/app/seat/seat-layout.component.ts`

**Purpose**: Main seat container, route component for `/seat`

**Layout**:
- Center: Question display (large text)
- Right: Money ladder (vertical, prominent)
- Bottom: Lifeline status indicators
- Top: Contestant name + current level

**Design**: Optimized for 1080p/4K second screen, show-style dramatic styling

### Step 5.2: Question Display Component (Seat)

**File**: `src/app/seat/question-display/question-display.component.ts`

**Purpose**: Read-only question and choices (seat side)

**Features**:
- Large question text
- 4 answer choices (using shared answer-choices component)
- No interaction (read-only)
- Show selected, locked, and revealed states

### Step 5.3: Seat Ladder Component

**File**: `src/app/seat/seat-ladder/seat-ladder.component.ts`

**Purpose**: Visual money ladder (seat side)

**Features**:
- Vertical ladder display
- Dramatic styling (gold/blue theme)
- Animated transitions (level climb)
- Current level pulsing effect
- Safe haven indicators

### Step 5.4: Lifeline Status Component

**File**: `src/app/seat/lifeline-status/lifeline-status.component.ts`

**Purpose**: Show lifeline availability (seat side)

**Features**:
- 3 lifeline icons (50:50, Ask Audience, Phone Friend)
- Visual states: Available, In Use, Used
- Display lifeline results:
  - 50:50: Removed choices grayed out
  - Ask Audience: Bar chart with percentages
  - Phone Friend: Suggestion text, timer countdown

### Step 5.5: Reveal Sequence Component

**File**: `src/app/seat/reveal-sequence/reveal-sequence.component.ts`

**Purpose**: Animated reveal of correct answer

**Features**:
- Angular animations for dramatic effect
- Highlight correct answer green
- If incorrect, show locked answer red
- Delay between states for dramatic pacing

---

## Phase 6: Routing & Integration

### Step 6.1: Configure Routes

**File**: `src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { HostLayoutComponent } from './host/host-layout.component';
import { SeatLayoutComponent } from './seat/seat-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: '/host', pathMatch: 'full' },
  { path: 'host', component: HostLayoutComponent },
  { path: 'seat', component: SeatLayoutComponent },
  { path: '**', redirectTo: '/host' }
];
```

### Step 6.2: Update App Component

**File**: `src/app/app.ts`

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class AppComponent {}
```

### Step 6.3: Configure App Config

**File**: `src/app/app.config.ts`

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations()
  ]
};
```

---

## Phase 7: Styling & Theming

### Step 7.1: Configure Angular Material Theme

**File**: `src/styles.scss`

```scss
@use '@angular/material' as mat;

// Define custom palette (show-style dramatic theme)
$primary-palette: mat.define-palette(mat.$blue-palette, 700);
$accent-palette: mat.define-palette(mat.$amber-palette, A400); // Gold
$warn-palette: mat.define-palette(mat.$red-palette);

$theme: mat.define-light-theme((
  color: (
    primary: $primary-palette,
    accent: $accent-palette,
    warn: $warn-palette,
  ),
  typography: mat.define-typography-config(),
  density: 0,
));

@include mat.all-component-themes($theme);

// Global styles
body {
  margin: 0;
  padding: 0;
  font-family: 'Roboto', sans-serif;
}

// Seat display styling (large screen)
.seat-display {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  font-size: 1.5rem;
  
  .question-text {
    font-size: 2.5rem;
    font-weight: 500;
  }
  
  .answer-choice {
    font-size: 2rem;
    padding: 1rem 2rem;
    margin: 1rem;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid gold;
    border-radius: 8px;
    
    &.selected {
      background: rgba(255, 215, 0, 0.3);
      border-color: gold;
    }
    
    &.correct {
      background: #4caf50;
      animation: pulse 1s;
    }
    
    &.incorrect {
      background: #f44336;
    }
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

### Step 7.2: Add ngx-layout Styles

Import in `src/styles.scss`:

```scss
@import '@ngbracket/ngx-layout/core';
```

---

## Phase 8: Sample Data

### Step 8.1: Create Sample Question Pack

**File**: `public/sample-questions.json`

Create a JSON file with 15 sample questions following the schema in `contracts/question-pack.schema.json`.

Example:
```json
{
  "name": "General Knowledge Sample Pack",
  "description": "15 sample questions for testing",
  "creator": "Game Dev Team",
  "questions": [
    {
      "id": "q1",
      "level": 1,
      "text": "What is the capital of France?",
      "choices": [
        { "key": "A", "text": "Paris" },
        { "key": "B", "text": "London" },
        { "key": "C", "text": "Berlin" },
        { "key": "D", "text": "Madrid" }
      ],
      "correctAnswer": "A",
      "category": "Geography",
      "difficulty": "easy"
    }
    // ... 14 more questions
  ]
}
```

### Step 8.2: Implement Sample Pack Loader

On app init, auto-load sample pack from `public/sample-questions.json` if no packs exist in localStorage.

---

## Phase 9: Testing & Validation

### Manual Testing Checklist

Per constitution, no automated tests. Validate through manual testing:

#### Core Game Flow
- [ ] Load sample question pack
- [ ] Start game from level 1
- [ ] Select answer, lock, reveal (correct)
- [ ] Advance to level 2
- [ ] Continue through multiple levels
- [ ] Answer incorrectly → verify safe haven winnings calculation
- [ ] Reset and start new game

#### Dual-Display Sync
- [ ] Open `/host` in main window
- [ ] Click "Open Seat Display" → popup opens at `/seat`
- [ ] Start question → verify appears on seat within 100ms
- [ ] Select choice → verify highlights on seat
- [ ] Lock final answer → verify locked state on seat
- [ ] Reveal answer → verify synchronized reveal animation
- [ ] Close seat window, reopen → verify state resyncs

#### Lifelines
- [ ] Activate 50:50 → verify 2 incorrect choices removed on both displays
- [ ] Activate Ask Audience → enter percentages, verify bar chart on seat
- [ ] Activate Phone Friend → enter suggestion, start timer, verify on seat
- [ ] Verify each lifeline can only be used once

#### Walk Away
- [ ] Reach level 7, click "Walk Away" → verify correct winnings (level 6 value)
- [ ] Walk away at level 5 (before answering) → verify level 4 winnings

#### Question Pack Import
- [ ] Create valid JSON pack, import → verify loads successfully
- [ ] Create invalid JSON (missing correct answer), import → verify validation error
- [ ] Import multiple packs → verify dropdown shows all packs

#### Edge Cases
- [ ] Refresh host during game → verify warning dialog
- [ ] Refresh seat during game → verify reconnects and syncs state
- [ ] Navigate away from host → verify warning dialog
- [ ] Try to use lifeline after final answer locked → verify disabled
- [ ] Try to reveal before locking answer → verify disabled/warning

---

## Phase 10: Deployment Preparation

### Step 10.1: Build for Production

```bash
ng build --configuration production
```

**Output**: `dist/who-wants-to-be-a-millionaire/` directory

### Step 10.2: Test Production Build Locally

```bash
# Install http-server if not already installed
npm install -g http-server

# Serve production build
http-server dist/who-wants-to-be-a-millionaire/browser -p 8080

# Open browser to http://localhost:8080
```

### Step 10.3: Verify BroadcastChannel in Production

- Open `/host`
- Open `/seat` in popup
- Verify sync still works (BroadcastChannel is native browser API, works in production)

---

## Implementation Priority Order

**Priority 1 (MVP - Core Game)**:
1. Phase 1: Core Models (all steps)
2. Phase 2: Core Services (all steps)
3. Phase 3: Shared Components (answer choices, timer)
4. Phase 4: Host UI (layout, setup, question control, ladder)
5. Phase 5: Seat UI (layout, question display, ladder)
6. Phase 6: Routing & Integration
7. Phase 8: Sample Data
8. Phase 9: Testing (basic game flow + sync)

**Priority 2 (Enhanced Gameplay)**:
1. Phase 4: Lifeline Control Component
2. Phase 5: Lifeline Status Component
3. Phase 4: Admin Panel Component
4. Phase 9: Testing (lifelines, walk away, edge cases)

**Priority 3 (Polish)**:
1. Phase 5: Reveal Sequence Component (animations)
2. Phase 7: Styling & Theming (dramatic effects)
3. Phase 3: Connection Status Component
4. Phase 9: Testing (all scenarios)

---

## Troubleshooting

### BroadcastChannel Not Working

**Symptom**: Seat display doesn't update when host makes changes

**Causes**:
- Different browser profiles (BroadcastChannel is per-profile)
- Different origins (http vs https, different ports)

**Solution**:
- Use same browser profile for host and seat
- Ensure both windows use same origin (e.g., both `localhost:4200`)

### Seat State Not Syncing on Reload

**Symptom**: Seat display blank after reload

**Cause**: STATE_SYNC_REQUEST not sent or not received

**Solution**:
- Verify seat sends STATE_SYNC_REQUEST on component init
- Verify host listens for STATE_SYNC_REQUEST and responds
- Check browser console for errors

### Angular Material Styles Not Applied

**Symptom**: Components look unstyled

**Cause**: Theme not imported or animations not provided

**Solution**:
- Verify `@include mat.all-component-themes($theme);` in `styles.scss`
- Verify `provideAnimations()` in `app.config.ts`
- Check browser console for CSS errors

---

## Success Criteria Validation

After implementation, validate against success criteria from spec:

- [ ] SC-001: Complete full game in under 5 minutes
- [ ] SC-002: Sync latency < 100ms
- [ ] SC-003: Seat reload syncs within 1 second
- [ ] SC-004: All lifelines work correctly
- [ ] SC-005: Safe haven rules applied correctly 100% of time
- [ ] SC-006: Custom ladder values used correctly
- [ ] SC-007: Validation catches all malformed packs
- [ ] SC-008: Walk away calculates winnings correctly
- [ ] SC-009: Invalid operations prevented 100% of time
- [ ] SC-010: Seat readable on 1080p/4K screens

---

## Next Steps After Quickstart

Once core implementation is complete:

1. Review constitution compliance (component isolation, state sync, Angular best practices)
2. Create polished sample question pack (15 questions covering various categories)
3. Document user guide for game operators (how to import packs, run game)
4. Consider enhancements:
   - Custom sound effects
   - More animation effects
   - Statistics/history tracking (in-memory only, per constitution)
   - Export game results

---

**Phase 1 Quickstart Complete**: Implementation roadmap fully defined with step-by-step instructions.
