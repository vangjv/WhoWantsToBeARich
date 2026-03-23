# Research Document: Who Wants to Be Rich Game Application

**Date**: 2025-12-14  
**Feature**: 001-rich-game-app

## Purpose

This document consolidates research findings for all technical decisions and unknowns identified in the Technical Context section of the implementation plan. Each research item resolves a "NEEDS CLARIFICATION" or provides best practices for a technology choice.

---

## 1. Angular 21+ Standalone Components and Signals

### Decision
Use Angular 21 standalone components exclusively (no NgModules) with signal-based reactivity for state management where appropriate, falling back to RxJS observables for complex async operations and BroadcastChannel event streams.

### Rationale
- **Standalone components** are the recommended approach in Angular 16+ and become the default in Angular 21
- Simplifies component architecture by eliminating NgModule boilerplate
- **Signals** provide fine-grained reactivity with better performance than traditional change detection
- Signals work well for local component state and derived computations
- RxJS observables remain ideal for event streams (BroadcastChannel messages) and async operations
- Hybrid approach (signals + observables) is officially supported and recommended by Angular team

### Alternatives Considered
- **Pure RxJS with BehaviorSubjects**: More verbose, lacks fine-grained reactivity, but familiar pattern
  - **Rejected**: Signals provide better DX and performance for local state; RxJS still used for streams
- **NgRx/Akita state management**: Full-featured store libraries with time-travel debugging
  - **Rejected**: Overkill for single-session game with simple state; adds unnecessary complexity

### Implementation Notes
- Use `signal()` and `computed()` for component-local state (e.g., UI flags, derived values)
- Use Angular services with RxJS `BehaviorSubject` or `ReplaySubject` for shared game state
- Expose observables from services; components can use `toSignal()` pipe to convert to signals if needed
- `OnPush` change detection strategy works optimally with signals

---

## 2. BroadcastChannel API with PostMessage Fallback

### Decision
Use BroadcastChannel API as primary mechanism for host-to-seat synchronization, with detection logic to verify support. Document single-origin limitation clearly in setup guide.

### Rationale
- **BroadcastChannel** is native browser API for cross-tab/cross-window messaging within same origin
- Zero latency (synchronous within event loop), no server/network required
- Supported in all modern browsers (Chrome 54+, Firefox 38+, Edge 79+, Safari 15.4+)
- Simple pub/sub model: host posts messages, seat listens
- **Single-origin constraint** is acceptable: both windows run from same localhost or domain
- **PostMessage fallback** would require maintaining window references (popup opener pattern)
  - More complex, requires explicit window handle management
  - Only needed for older browsers (not target platform per requirements)

### Alternatives Considered
- **window.postMessage()**: Works cross-origin, requires maintaining window references
  - **Rejected**: More complex implementation, unnecessary given same-origin constraint
- **localStorage events**: Can sync across tabs by writing to localStorage and listening for `storage` event
  - **Rejected**: Slower, hacky, not designed for high-frequency messaging
- **WebSocket with local server**: Real-time bidirectional communication
  - **Rejected**: Requires backend server, violates "no backend" constraint (FR-038, constitution)
- **Shared Worker**: JavaScript worker shared across tabs
  - **Rejected**: More complex setup, less browser support than BroadcastChannel

### Implementation Notes
```typescript
// SyncService pattern
const channel = new BroadcastChannel('rich-game');

// Host (sender)
channel.postMessage({ type: 'QUESTION_STARTED', payload: currentQuestion });

// Seat (receiver)
channel.onmessage = (event) => {
  const { type, payload } = event.data;
  // Update local state based on event type
};
```
- Create single BroadcastChannel instance in SyncService (singleton)
- Host service posts messages on every state mutation
- Seat service listens and updates local state mirrors
- On seat load/reload, send STATE_SYNC request message; host responds with full state

---

## 3. Angular Material + ngx-layout Integration

### Decision
Use Angular Material 21 for UI components (buttons, cards, dialogs, form controls) and ngx-layout for flexbox-based responsive layouts. Apply custom SCSS theme for show-style visual fidelity.

### Rationale
- **Angular Material** provides production-ready, accessible components following Material Design
- Saves development time on common UI patterns (buttons, inputs, dialogs, progress bars)
- **ngx-layout** (formerly Angular Flex Layout) provides declarative flexbox directives (`fxLayout`, `fxFlex`, `fxLayoutAlign`)
- Simplifies responsive layout without writing extensive CSS
- Material theme system allows custom color palettes for show-inspired styling (gold/blue dramatic theme)
- Both libraries have strong Angular integration and TypeScript support

### Alternatives Considered
- **Tailwind CSS with headless components**: Utility-first CSS framework
  - **Rejected**: More manual component building, less out-of-box accessibility, steeper learning curve
- **PrimeNG**: Comprehensive UI component library
  - **Rejected**: Not specified in requirements; Material already preferred in original spec
- **Pure CSS Grid/Flexbox**: Manual layout without library
  - **Rejected**: More verbose, less maintainable for complex layouts; ngx-layout provides cleaner templates

### Implementation Notes
- Install Angular Material: `ng add @angular/material` (theme: custom, typography: yes, animations: yes)
- Install ngx-layout: `npm install @angular/flex-layout` or `npm install @ngbracket/ngx-layout` (maintained fork)
- Create custom Material theme in `styles.scss`:
  ```scss
  @use '@angular/material' as mat;
  $primary: mat.define-palette(mat.$blue-palette, 700);
  $accent: mat.define-palette(mat.$amber-palette, A400); // Gold accent
  $theme: mat.define-light-theme($primary, $accent);
  @include mat.all-component-themes($theme);
  ```
- Use ngx-layout directives in templates:
  ```html
  <div fxLayout="row" fxLayoutAlign="space-between center">
    <div fxFlex="60">Question text</div>
    <div fxFlex="40">Ladder</div>
  </div>
  ```

---

## 4. State Synchronization Patterns for Dual-Display Applications

### Decision
Implement **Command-Query Responsibility Segregation (CQRS)** pattern at application level: Host = Command side (write), Seat = Query side (read-only). Use event sourcing pattern for sync: host emits fine-grained events, seat applies events to rebuild state.

### Rationale
- **CQRS** naturally maps to dual-display architecture: host mutates state, seat observes state
- Clear separation of concerns: host has complex controls, seat has simple rendering
- **Event sourcing** ensures seat can reconstruct state from event stream
- Fine-grained events (QUESTION_STARTED, CHOICE_SELECTED, FINAL_LOCKED, REVEAL) provide precise sync points
- Seat reconnection handled by STATE_SYNC request → host sends current state snapshot
- Pattern scales well if we later need multiple seat displays or logging/replay

### Alternatives Considered
- **Full state broadcast on every change**: Simple, but wasteful for large state
  - **Rejected**: Works for small state, but less scalable; harder to debug individual actions
- **Delta/diff-based updates**: Only send changed fields
  - **Rejected**: More complex to implement; event-driven approach is clearer and sufficient
- **Polling from seat**: Seat periodically requests state
  - **Rejected**: Introduces latency, not truly real-time, wasteful

### Implementation Notes
- Define SyncEvent union type:
  ```typescript
  type SyncEventType = 
    | 'STATE_SYNC_REQUEST'   // Seat → Host: request full state
    | 'STATE_SYNC_RESPONSE'  // Host → Seat: full state snapshot
    | 'QUESTION_STARTED'     // Host → Seat: new question displayed
    | 'CHOICE_SELECTED'      // Host → Seat: contestant selected choice
    | 'FINAL_LOCKED'         // Host → Seat: final answer locked
    | 'REVEAL_SHOWN'         // Host → Seat: reveal sequence triggered
    | 'LIFELINE_USED'        // Host → Seat: lifeline activated
    | 'TIMER_TICK'           // Host → Seat: timer updated (1/sec)
    | 'GAME_ENDED'           // Host → Seat: game finished
    | 'WALK_AWAY'            // Host → Seat: contestant walked away
    ;
  
  interface SyncEvent {
    type: SyncEventType;
    payload: any; // Typed by event type
    timestamp: number;
  }
  ```
- Host GameStateService emits events after each mutation
- Seat SyncService receives events and applies to local GameState mirror
- Seat loads → send STATE_SYNC_REQUEST → host replies with STATE_SYNC_RESPONSE containing full state

---

## 5. Question Pack Validation Strategies

### Decision
Implement client-side JSON schema validation using Zod (TypeScript-first schema library) to validate question pack structure and business rules before loading into game.

### Rationale
- **Zod** provides type-safe schema validation with excellent TypeScript integration
- Can define complex validation rules (e.g., "percentages sum to 100", "correct answer exists in choices")
- Generates helpful error messages for malformed data
- Lightweight (no runtime dependencies)
- Validation happens at import time (not runtime), providing fast feedback

### Alternatives Considered
- **Ajv (JSON Schema validator)**: Industry-standard JSON Schema implementation
  - **Rejected**: JSON Schema syntax more verbose than Zod; less TypeScript-native
- **Manual validation with TypeScript type guards**: Custom validation functions
  - **Rejected**: More code to write and maintain; less declarative than schema approach
- **Joi**: Schema validation library (originally for Node.js)
  - **Rejected**: Heavier than Zod, less TypeScript-first in design

### Implementation Notes
```typescript
import { z } from 'zod';

const ChoiceSchema = z.object({
  key: z.enum(['A', 'B', 'C', 'D']),
  text: z.string().min(1),
});

const QuestionSchema = z.object({
  id: z.string(),
  level: z.number().int().min(1).max(15),
  text: z.string().min(10),
  choices: z.array(ChoiceSchema).length(4),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']),
  category: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  explanation: z.string().optional(),
  mediaUrl: z.string().url().optional(),
}).refine(
  (q) => q.choices.some((c) => c.key === q.correctAnswer),
  { message: 'Correct answer must exist in choices' }
);

const QuestionPackSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  creator: z.string().optional(),
  questions: z.array(QuestionSchema).min(1).max(15),
}).refine(
  (pack) => {
    const levels = pack.questions.map((q) => q.level).sort((a, b) => a - b);
    return levels.every((level, idx) => level === idx + 1);
  },
  { message: 'Question levels must be contiguous from 1 to N' }
);
```
- Validate on import: `QuestionPackSchema.parse(jsonData)`
- If validation fails, show error dialog with specific issues
- If validation passes, store pack in localStorage or in-memory
- Additional runtime checks: choice keys unique within question, Ask Audience percentages sum to 100

---

## 6. Angular Animation System for Reveal Sequences

### Decision
Use Angular's built-in `@angular/animations` module for answer reveal sequences, ladder climb effects, and lifeline activation animations. Leverage state-based transitions and keyframe animations for dramatic timing.

### Rationale
- **Angular animations** integrate seamlessly with component lifecycle and state changes
- Declarative animation definitions in component metadata
- Supports complex sequences: delays, parallel animations, stagger effects
- Hardware-accelerated CSS transforms under the hood
- Easier to test and maintain than manual CSS class manipulation or JavaScript animation libraries

### Alternatives Considered
- **CSS transitions/animations only**: Simpler, no framework dependency
  - **Rejected**: Less control over timing and sequencing; harder to coordinate multi-element animations
- **GreenSock (GSAP)**: Professional animation library with timeline controls
  - **Rejected**: Adds external dependency, overkill for this use case; Angular animations sufficient
- **Framer Motion / Motion One**: Modern web animation libraries
  - **Rejected**: Not Angular-specific; less integration with Angular change detection

### Implementation Notes
```typescript
// Example reveal animation in component
animations: [
  trigger('revealAnswer', [
    state('hidden', style({ opacity: 0 })),
    state('correct', style({ opacity: 1, backgroundColor: '#4caf50' })),
    state('incorrect', style({ opacity: 1, backgroundColor: '#f44336' })),
    transition('hidden => correct', [
      animate('300ms ease-in', style({ opacity: 1 })),
      animate('500ms 200ms', style({ backgroundColor: '#4caf50' }))
    ]),
    transition('hidden => incorrect', [
      animate('300ms ease-in', style({ opacity: 1 })),
      animate('500ms 200ms', style({ backgroundColor: '#f44336' }))
    ]),
  ])
]
```
- Use `[@animationName]="currentState"` binding in templates
- Trigger state changes from component logic (e.g., when reveal event received)
- Coordinate multiple animations with delays and callbacks
- Seat display components use animations extensively; host display minimal animations

---

## 7. Client-Side Storage Strategy (sessionStorage vs localStorage)

### Decision
Use **sessionStorage** for current game state (cleared on tab close) and **localStorage** for persistent data (imported question packs, ladder configurations, user preferences).

### Rationale
- **sessionStorage** provides isolation per tab: closing host tab clears game, prevents stale state
- **localStorage** persists across sessions: question packs don't need re-import every time
- Clear separation: ephemeral game data vs. persistent configuration
- BroadcastChannel syncs game state in real-time; storage is backup for reconnect/refresh scenarios

### Alternatives Considered
- **Only BroadcastChannel (no storage)**: Pure in-memory state
  - **Rejected**: Seat reload would lose state if host doesn't detect reload quickly
- **Only localStorage**: Persist everything
  - **Rejected**: Game state persisting after host closes tab could cause confusion
- **IndexedDB**: Client-side database for structured data
  - **Rejected**: Overkill for simple key-value storage; adds complexity

### Implementation Notes
- On host state mutation: update in-memory state + sessionStorage backup
- On seat reload: check sessionStorage for last known state (fallback), then request STATE_SYNC from host
- On question pack import: validate, then save to localStorage with unique key
- On ladder config change: save to localStorage
- Clear sessionStorage on game end or new game start

---

## 8. Timer Implementation (Question Timer and Phone a Friend Timer)

### Decision
Use RxJS `interval()` and `takeUntil()` operators for countdown timers. Sync timer ticks from host to seat via TIMER_TICK events (1/second granularity). Store timer state in GameState for reconstruction.

### Rationale
- **RxJS interval** provides clean, cancellable timer implementation
- Host owns timer logic; seat just displays received values (no clock drift issues)
- 1-second granularity sufficient for game show format (not millisecond precision)
- Timer state (remaining seconds) included in GameState for reconnect scenarios
- Host can pause/reset timers; events propagate to seat immediately

### Alternatives Considered
- **setInterval/setTimeout**: Native JavaScript timers
  - **Rejected**: Less composable, harder to manage cleanup, no RxJS integration
- **requestAnimationFrame**: High-frequency updates for smooth animations
  - **Rejected**: Overkill for 1-second countdown; wastes resources
- **Web Workers**: Offload timer logic to background thread
  - **Rejected**: Unnecessary complexity for simple countdown

### Implementation Notes
```typescript
// TimerService
startTimer(durationSeconds: number): Observable<number> {
  return interval(1000).pipe(
    map((tick) => durationSeconds - tick - 1),
    takeWhile((remaining) => remaining >= 0),
    tap((remaining) => this.syncService.sendTimerTick(remaining)),
    finalize(() => this.syncService.sendTimerExpired())
  );
}
```
- Host subscribes to timer observable, updates GameState
- Each tick emits TIMER_TICK event with remaining seconds
- Seat receives events and updates timer display component
- Store `timerRemaining: number | null` in GameState
- On seat reconnect, timer resumes from last known value

---

## 9. Popup Window Management (Opening and Detecting Seat Display)

### Decision
Use `window.open()` with specific window features (fullscreen, toolbar hidden) to open seat display. Host tracks popup window handle for connection status detection (check `window.closed` property periodically).

### Rationale
- **window.open()** is standard API for opening new windows/popups
- Can specify window features (size, position, chrome visibility) for second-screen optimization
- Host retains window reference to detect when popup closes
- BroadcastChannel handles messaging; window handle only needed for connection status
- Seat display polls or listens for focus/blur events to detect when moved to second screen

### Alternatives Considered
- **Fullscreen API**: Request fullscreen on seat display after opening
  - **Partially adopted**: Can be combined with window.open for kiosk-like experience
- **Electron/Desktop wrapper**: Desktop app with multi-window support
  - **Rejected**: Adds deployment complexity; web-only constraint per requirements
- **No popup management**: Expect user to manually open /seat in new window
  - **Rejected**: Worse UX; one-click "Open Seat Display" is better operator experience

### Implementation Notes
```typescript
// Host service
openSeatDisplay(): void {
  const features = 'width=1920,height=1080,toolbar=no,menubar=no,location=no';
  this.seatWindow = window.open('/seat', 'RichSeat', features);
  
  // Poll for connection status
  this.connectionCheck$ = interval(2000).pipe(
    map(() => this.seatWindow && !this.seatWindow.closed),
    distinctUntilChanged(),
    tap((connected) => this.connectionStatus.next(connected))
  ).subscribe();
}
```
- Host displays "Open Seat Display" button in setup
- Clicking opens popup with specified dimensions
- Connection status indicator updates based on `seatWindow.closed` check
- Seat display self-identifies via BroadcastChannel handshake on load

---

## 10. TypeScript Strict Mode and Type Safety

### Decision
Enable TypeScript strict mode (`"strict": true` in tsconfig.json) and define exhaustive type definitions for all models, events, and service interfaces. Use discriminated unions for SyncEvent types.

### Rationale
- **Strict mode** catches entire classes of runtime errors at compile time
- Forces explicit null/undefined handling (nullish checks, optional chaining)
- Discriminated unions provide type-safe event handling (TypeScript narrows types based on `type` field)
- Better IDE autocomplete and refactoring support
- Aligns with Angular best practices and constitution (IV: Angular Best Practices)

### Alternatives Considered
- **Loose TypeScript mode**: Faster initial development
  - **Rejected**: More runtime errors, less maintainable, doesn't meet "production-quality" goal
- **Any-driven development**: Liberal use of `any` type
  - **Rejected**: Defeats purpose of TypeScript, increases bug risk

### Implementation Notes
```typescript
// Discriminated union for sync events
type SyncEvent =
  | { type: 'QUESTION_STARTED'; payload: Question }
  | { type: 'FINAL_LOCKED'; payload: { choice: 'A' | 'B' | 'C' | 'D' } }
  | { type: 'REVEAL_SHOWN'; payload: { correct: boolean } }
  | { type: 'STATE_SYNC_RESPONSE'; payload: GameState }
  // ... more event types

// Type-safe event handler
handleSyncEvent(event: SyncEvent): void {
  switch (event.type) {
    case 'QUESTION_STARTED':
      // TypeScript knows event.payload is Question
      this.currentQuestion = event.payload;
      break;
    case 'FINAL_LOCKED':
      // TypeScript knows event.payload has { choice: 'A'|'B'|'C'|'D' }
      this.lockedAnswer = event.payload.choice;
      break;
    // ...
  }
}
```
- All models defined as `interface` or `type` with explicit fields
- Enums for fixed sets (GamePhase, LifelineType, ChoiceKey)
- Generic types where appropriate (Observable<T>, Promise<T>)
- Strict null checks force `null` and `undefined` handling

---

## Summary of Resolved Clarifications

All "NEEDS CLARIFICATION" items from Technical Context have been resolved:

1. ✅ **Angular 21+ standalone + signals**: Use standalone components, signals for local state, RxJS for streams
2. ✅ **BroadcastChannel implementation**: Primary sync mechanism, no fallback needed (modern browsers only)
3. ✅ **Angular Material + ngx-layout**: Both adopted for UI components and flexbox layouts
4. ✅ **State sync patterns**: CQRS + event sourcing, host = write, seat = read
5. ✅ **Question pack validation**: Zod for TypeScript-first schema validation
6. ✅ **Animations**: Angular animations module for reveal sequences
7. ✅ **Storage strategy**: sessionStorage (game state) + localStorage (question packs)
8. ✅ **Timer implementation**: RxJS interval with 1-second granularity, synced via events
9. ✅ **Popup management**: window.open with connection status tracking
10. ✅ **TypeScript strict mode**: Enabled with discriminated unions for type safety

**Phase 0 Complete**: All technical unknowns resolved. Ready to proceed to Phase 1 (Design & Contracts).
