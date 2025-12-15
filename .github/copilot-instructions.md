# Who Wants to Be a Millionaire - Game Application

## Architecture Overview

**Dual-Display Game Show Application**: This Angular 21+ app implements a "Who Wants to Be a Millionaire" game with **two synchronized browser windows**:
- **Host UI** (`/host`): Full game control - loads questions, triggers reveals, manages lifelines, timer, and adjudication
- **Seat UI** (`/seat`): Contestant/audience display - read-only, show-style presentation for second screen (1080p/4K optimized)

**Critical Synchronization Pattern**: Host owns all game state mutations; Seat is a pure consumer. Use `BroadcastChannel` API (`millionaire-game` channel) for cross-window sync with `STATE_SYNC_REQUEST`/`STATE_SYNC_RESPONSE` pattern on reload. Seat must survive close/refresh and reconnect automatically.

## Tech Stack

- **Angular 21+ (currently 20.3.0)** with standalone components, signals-based reactivity
- **Angular Material** for UI components
- **ngx-layout** (@ngbracket/ngx-layout) for responsive layouts
- **RxJS 7.8** for observables and async state
- **OnPush change detection** strategy for all components
- **No persistence**: Session-based state in browser memory only (no localStorage/backend)
- **No testing framework**: Manual testing against acceptance scenarios only (per project constitution)

## Data Model & State Management

All data models defined in [`specs/001-millionaire-game-app/contracts/typescript-interfaces.md`](../specs/001-millionaire-game-app/contracts/typescript-interfaces.md). Implement interfaces in `src/app/models/`.

**Root State**: `GameState` interface with strict phase transitions:
```
SETUP → QUESTION → FINAL_LOCKED → REVEAL → BETWEEN → ENDED → SETUP
```

**Key Entities**: `Question`, `QuestionPack`, `MoneyLadder`, `LifelineState`, `TimerState`

**Service Pattern**: 
- `GameStateService` (host-only): Manages state mutations, emits to BroadcastChannel
- `SyncService`: Handles BroadcastChannel messaging (bidirectional)
- Seat components subscribe to `SyncService` observables, never mutate state

## Routing & Window Management

Two routes only:
- `/host` - Host control console (one active instance per browser profile)
- `/seat` - Contestant display (popup window opened by host via `window.open()`)

**Popup Window Requirement**: Host must trigger `window.open('/seat', ...)` with proper dimensions. Seat must request full state sync on load via `STATE_SYNC_REQUEST` message.

## Question Pack Format

JSON validation required (use Zod or similar):
- 15 questions per pack, levels 1-15
- Each question: `id`, `level`, `text`, `choices[4]`, `correctAnswer` (A/B/C/D)
- Exactly 4 choices with unique keys A-D
- Optional: `category`, `difficulty`, `explanation`, `mediaUrl` (http/https/file:// paths)
- See [`specs/001-millionaire-game-app/contracts/question-pack.schema.json`](../specs/001-millionaire-game-app/contracts/question-pack.schema.json)

## Money Ladder Configuration

Default: `[$100, $200, $300, $500, $1K, $2K, $4K, $8K, $16K, $32K, $64K, $125K, $250K, $500K, $1M]`

**Safe Havens**: Levels 5 and 10 (configurable). Walk away winnings = last cleared level amount.

## Lifelines Implementation

**50:50**: Remove 2 of 3 incorrect answers randomly; disable after use  
**Ask the Audience**: Host enters percentages (must sum to 100); display bar chart on Seat  
**Phone a Friend**: Optional 30s timer + host-entered text suggestion  

All lifelines: One-time use, disable button after activation, sync status to Seat immediately.

## Sync Protocol Specification

All messages: `{ type: string, payload: any, timestamp: number }`

**Critical Events** (see [`specs/001-millionaire-game-app/contracts/sync-event.protocol.md`](../specs/001-millionaire-game-app/contracts/sync-event.protocol.md)):
- `STATE_SYNC_REQUEST` (Seat → Host): Request full state on load/reconnect
- `STATE_SYNC_RESPONSE` (Host → Seat): Full GameState snapshot
- `QUESTION_STARTED`, `ANSWER_SELECTED`, `FINAL_LOCKED`, `REVEAL_CORRECT`, `GAME_ENDED`

**Never expose `correctAnswer` field to Seat until REVEAL phase**. Host retains this in internal state.

## UI/UX Requirements

**Seat Display**:
- Show-style dramatic theme (gold/blue palette, large fonts, animations)
- Smooth transitions between all phases (CSS animations, Angular animations API)
- Connection status indicator (connected/disconnected) without blocking modals
- Optimized for 1080p/4K second-screen display

**Host Display**:
- Compact control panel with all game actions visible
- Question pack import/selection
- Timer controls, lifeline buttons (disabled state when used)
- Reveal sequence control, walk away button (disabled when final answer locked)

## Component Architecture

Isolate features into standalone components:
- `QuestionDisplayComponent` (host + seat variants)
- `MoneyLadderComponent` (shared)
- `LifelineControlsComponent` (host-only)
- `TimerComponent` (shared, sync countdown)
- `QuestionPackImporterComponent` (host-only)

Use `@Input()` for data, `@Output()` for events, shared services for cross-component state. Never directly couple components.

## Development Workflow

**Start dev server**: `npm start` or `ng serve` (http://localhost:4200)  
**Build**: `ng build` (outputs to `dist/`)  
**Generate component**: `ng generate component <name> --standalone`  

**No test commands**: Tests excluded per project constitution.

## Known Constraints

- **Single-origin only**: BroadcastChannel requires same protocol + domain + port (no cross-device play)
- **One host per browser profile**: Multiple host tabs cause state conflicts
- **Popup dependency**: Users must allow popups for this domain
- **No persistence**: Closing all windows ends session permanently

## Specification Documents

All requirements, user stories, and acceptance scenarios in [`specs/001-millionaire-game-app/spec.md`](../specs/001-millionaire-game-app/spec.md). Implementation plan in [`specs/001-millionaire-game-app/plan.md`](../specs/001-millionaire-game-app/plan.md). Reference these for clarifications.
