# Implementation Plan: Who Wants to Be Rich Game Application

**Branch**: `001-rich-game-app` | **Date**: 2025-12-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-rich-game-app/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build an Angular 21+ single-page application implementing a "Who Wants to Be Rich" style game show with dual synchronized displays (host control UI at `/host` and contestant display UI at `/seat`). The application runs entirely client-side with real-time synchronization between windows using BroadcastChannel API, supporting 15-level money ladder, three lifelines (50:50, Ask the Audience, Phone a Friend), walk-away option, optional timers, and custom question pack import via JSON.

**Technical Approach**: Angular 21 standalone components with signal-based reactivity, Angular Material UI components, BroadcastChannel API for cross-window synchronization, service-based state management with RxJS observables, and show-style UX fidelity optimized for 1080p/4K second-screen display.

## Technical Context

**Language/Version**: TypeScript 5.9+ / Angular 21+ (Angular 20.3.0 currently installed)  
**Primary Dependencies**: Angular Material, ngx-layout (@ngbracket/ngx-layout), RxJS 7.8, Zod (for JSON validation)  
**Storage**: Client-side session-based (browser memory only, no persistence required for MVP)  
**Testing**: Tests explicitly excluded per constitution (manual testing only)  
**Target Platform**: Modern web browsers (Chrome, Edge, Firefox, Safari latest) on desktop  
**Project Type**: Single-page web application with dual-route architecture  
**Performance Goals**: <100ms synchronization latency between host and seat displays, 60fps UI animations  
**Constraints**: Client-side only (no backend), single-origin BroadcastChannel (both windows from same domain), popup window must survive reload with state resync  
**Scale/Scope**: Single-session game, 15 questions per pack, 2 concurrent windows (host + seat), ~15-20 Angular components

**Known Limitations**:
- **Single-origin constraint**: BroadcastChannel API requires both host and seat windows to be from the same origin (protocol + domain + port). Cross-device or cross-network play is not supported in MVP.
- **Single host per browser profile**: Only one browser window can act as the host at a time within the same browser profile. Multiple host windows would result in state conflicts and synchronization issues. To run multiple independent games, use separate browser profiles or different browsers.
- **No persistence across browser restarts**: Game state is session-based (browser memory + sessionStorage). Closing all game windows ends the session permanently.
- **Popup window dependency**: Seat display relies on browser allowing popup windows. Users must not block popups for this domain.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Component-Based Architecture
- Host UI and Seat UI are separate routes with independent component trees
- Each feature (question display, lifelines, timer, ladder) implemented as isolated components
- Components communicate via Input/Output and shared services (no direct cross-component access)
- **Status**: COMPLIANT

### ✅ II. Synchronized State Management
- Host window owns all game state mutations
- Seat window is read-only consumer via BroadcastChannel subscription
- SyncService implements BroadcastChannel messaging with STATE_SYNC request pattern
- Full state model includes all fields for UI reconstruction (GameState entity)
- **Status**: COMPLIANT

### ✅ III. No Testing Required
- No unit, integration, or E2E tests will be written
- Validation occurs through manual testing against acceptance scenarios
- **Status**: COMPLIANT

### ✅ IV. Angular Best Practices
- Angular 20.3.0 installed (21+ compatible, update to 21 if needed)
- Standalone components configured (no NgModules planned)
- Angular Material ready for UI components
- RxJS 7.8 for observables and async operations
- TypeScript 5.9.2 with strict mode enabled in tsconfig.json
- OnPush change detection strategy planned for all components
- **Status**: COMPLIANT

### ✅ V. Show-Like UX Fidelity
- Seat UI designed for 1080p/4K display with high visual polish
- SCSS custom theming for show-inspired styling (gold/blue dramatic palette)
- Animations and transitions planned for all state changes
- Distinct visual treatments for all game phases
- **Status**: COMPLIANT

**GATE RESULT**: ✅ **PASS** - All constitutional principles are satisfied by the design

## Project Structure

### Documentation (this feature)

```text
specs/001-rich-game-app/
├── plan.md                          # This file (/speckit.plan command output) ✅
├── research.md                      # Phase 0 output (/speckit.plan command) ✅
├── data-model.md                    # Phase 1 output (/speckit.plan command) ✅
├── quickstart.md                    # Phase 1 output (/speckit.plan command) ✅
├── spec.md                          # Feature specification ✅
├── contracts/                       # Phase 1 output (/speckit.plan command) ✅
│   ├── README.md
│   ├── question-pack.schema.json
│   ├── sync-event.protocol.md
│   └── typescript-interfaces.md
├── checklists/
│   └── requirements.md
└── tasks.md                         # Phase 2 output (/speckit.tasks command - NOT yet created)
```

### Source Code (repository root)

**Selected Structure**: Single-page web application with dual-route architecture

```text
c:\Projects\WhoWantsToBeRich\
├── angular.json                     # Angular project configuration
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration (strict mode enabled)
├── tsconfig.app.json
├── tsconfig.spec.json
├── README.md
├── spec.md                          # Project-level spec
├── public/                          # Static assets
│   └── sample-questions.json        # (to be created) Sample question pack
├── src/
│   ├── index.html                   # Main HTML entry point
│   ├── main.ts                      # Angular bootstrap
│   ├── styles.scss                  # Global styles and Material theme
│   └── app/
│       ├── app.ts                   # Root standalone component
│       ├── app.html                 # Root template
│       ├── app.scss                 # Root styles
│       ├── app.config.ts            # Application configuration (providers, Material, routes)
│       ├── app.routes.ts            # Route definitions (/host, /seat)
│       ├── models/                  # TypeScript interfaces and enums (to be created)
│       │   ├── choice-key.model.ts
│       │   ├── game-phase.model.ts
│       │   ├── game-state.model.ts
│       │   ├── question.model.ts
│       │   ├── money-ladder.model.ts
│       │   ├── lifeline.model.ts
│       │   └── sync-event.model.ts
│       ├── services/                # Singleton services for state and sync (to be created)
│       │   ├── game-state.service.ts
│       │   ├── sync.service.ts
│       │   ├── question-pack.service.ts
│       │   └── timer.service.ts
│       ├── host/                    # Host UI components (to be created)
│       │   ├── host-layout.component.ts
│       │   ├── setup-panel.component.ts
│       │   ├── host-question.component.ts
│       │   ├── host-controls.component.ts
│       │   ├── lifeline-controls.component.ts
│       │   └── admin-panel.component.ts
│       ├── seat/                    # Seat UI components (to be created)
│       │   ├── seat-layout.component.ts
│       │   ├── seat-question.component.ts
│       │   ├── seat-ladder.component.ts
│       │   └── seat-lifelines.component.ts
│       └── shared/                  # Shared components and utilities (to be created)
│           ├── money-ladder.component.ts
│           ├── timer.component.ts
│           ├── choice-button.component.ts
│           └── validation.utils.ts
└── specs/                           # Feature documentation directory
    └── 001-rich-game-app/    # This feature's documentation
```

**Structure Decision**: 
- **Single-page application** structure selected (no backend, no mobile clients)
- **Dual-route architecture**: `/host` and `/seat` routes with separate component trees
- **Models**: TypeScript interfaces for all entities defined in data-model.md
- **Services**: Singleton services using RxJS for state management and BroadcastChannel for sync
- **Host/Seat separation**: Components organized by UI role (host control vs. seat display)
- **Shared components**: Reusable UI elements used by both host and seat (ladder, timer, choices)
- **No tests directory**: Per constitution, testing is excluded

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No violations - all constitutional principles are satisfied by the current design. No complexity justifications required.

## Implementation Phases Summary

### Phase 0: Outline & Research ✅ **COMPLETED**

**Deliverable**: [research.md](./research.md)

**Scope**: Research and document all technical decisions for unknowns identified during planning:
- Angular 21+ standalone components and signals strategy
- BroadcastChannel API usage patterns and browser support
- Angular Material + ngx-layout integration approach
- SCSS theming strategy for show-style UX
- JSON validation approach using Zod
- OnPush change detection optimization techniques
- Component communication patterns (Input/Output/Services)
- Timer implementation strategy (RxJS interval vs. setInterval)
- Popup window management and reconnection patterns

**Status**: All research completed and documented in research.md with decisions, rationale, alternatives considered, and implementation notes for each topic.

---

### Phase 1: Design & Contracts ✅ **COMPLETED**

**Deliverables**: 
- [data-model.md](./data-model.md) - Complete entity definitions with fields, relationships, validation rules
- [contracts/](./contracts/) - API contracts and schemas
  - [question-pack.schema.json](./contracts/question-pack.schema.json) - JSON schema for question pack validation
  - [sync-event.protocol.md](./contracts/sync-event.protocol.md) - BroadcastChannel message protocol
  - [typescript-interfaces.md](./contracts/typescript-interfaces.md) - TypeScript interface definitions
  - [README.md](./contracts/README.md) - Contracts overview and usage guide
- [quickstart.md](./quickstart.md) - Step-by-step implementation guide with code samples

**Scope**: 
- Define all data entities (GameState, Question, QuestionPack, MoneyLadder, LifelineState, etc.)
- Document validation rules and state transitions
- Create JSON schema for question pack import validation
- Define BroadcastChannel sync event protocol (message types, payloads, sequencing)
- Generate TypeScript interfaces for all models and events
- Provide quickstart implementation roadmap from foundation to features

**Status**: All Phase 1 artifacts completed. Data model defines 8 core entities with full field specifications. Contracts include JSON schema for validation, sync protocol for cross-window messaging, and TypeScript interfaces. Quickstart provides step-by-step implementation guide organized by layers.

**Agent Context Update**: Pending - see Phase 1 completion steps below.

---

### Phase 2: Implementation Planning 🔄 **NEXT STEP**

**Deliverable**: `tasks.md` (NOT created by `/speckit.plan` - requires `/speckit.tasks` command)

**Scope**: Break down implementation into concrete, trackable tasks organized by priority and dependencies:
- Task decomposition by user story (P1 → P2 → P3)
- Component implementation tasks with file paths and acceptance criteria
- Service implementation tasks with state management and sync logic
- UI styling and theming tasks with design specifications
- Manual testing checklist per acceptance scenario
- Integration milestones and demo-ready checkpoints

**Status**: NOT STARTED - awaiting `/speckit.tasks` command execution

---

## Phase 1 Completion Steps

### Step 1: Update Agent Context ⏳ **REQUIRED**

Run the agent context update script to register new technologies and patterns from this plan:

```powershell
.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot
```

**Purpose**: Updates `.github/copilot-instructions.md` with:
- Angular 21 standalone components pattern
- BroadcastChannel API usage for cross-window sync
- Signal-based reactivity with RxJS observables
- Angular Material + ngx-layout integration
- Zod for JSON validation
- Show-style UX fidelity requirements

**Note**: This ensures GitHub Copilot has full context when generating implementation code.

---

### Step 2: Re-evaluate Constitution Check ✅

**Re-check after Phase 1 design**:

#### I. Component-Based Architecture
- ✅ Data model defines clear component boundaries (Host, Seat, Shared)
- ✅ Services provide state management without direct component coupling
- ✅ Contracts define clean Input/Output interfaces

#### II. Synchronized State Management
- ✅ Sync event protocol defines 10 message types with full/delta payloads
- ✅ GameState entity includes all fields for complete UI reconstruction
- ✅ STATE_SYNC request/response pattern documented for reconnection

#### III. No Testing Required
- ✅ Quickstart focuses on implementation, not test setup
- ✅ Validation approach is manual against acceptance scenarios

#### IV. Angular Best Practices
- ✅ TypeScript interfaces use strict typing
- ✅ Standalone component pattern confirmed in quickstart
- ✅ OnPush change detection documented in research
- ✅ RxJS observables for async operations

#### V. Show-Like UX Fidelity
- ✅ Seat components designed for 1080p/4K display
- ✅ SCSS theming strategy documented
- ✅ Animation requirements captured in quickstart

**GATE RESULT**: ✅ **PASS** - Design phase maintains constitutional compliance

---

## Recommendations

### Immediate Next Steps
1. ✅ Run agent context update script (see Phase 1 completion above)
2. ⏳ Execute `/speckit.tasks` command to generate task breakdown
3. ⏳ Review generated tasks.md and prioritize P1 user stories
4. ⏳ Begin implementation following quickstart.md sequence

### Development Workflow
1. Start with **Phase 1: Core Models & Types** from quickstart.md
2. Implement **Phase 2: Services** (GameState, Sync, QuestionPack)
3. Build **Phase 3: Shared Components** (reusable UI elements)
4. Develop **Phase 4: Host UI** (control interface)
5. Develop **Phase 5: Seat UI** (contestant display)
6. Validate against acceptance scenarios from spec.md

### Key Dependencies to Install
```bash
npm install @angular/material @angular/cdk
npm install @ngbracket/ngx-layout
npm install zod
```

### Manual Testing Strategy
- Test each component in isolation as built
- Test host-seat sync after each state mutation feature
- Test reconnection/reload scenarios continuously
- Validate UI on 1080p and 4K displays for seat component
- Run through acceptance scenarios for each user story before marking complete

### Documentation Maintenance
- Update quickstart.md if implementation patterns deviate from plan
- Document any constitution violations in plan.md complexity tracking
- Keep contracts/ updated if message protocol or data model changes

---

## References

- **Feature Specification**: [spec.md](./spec.md)
- **Constitution**: [../../.specify/memory/constitution.md](../../.specify/memory/constitution.md)
- **Research Findings**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Implementation Guide**: [quickstart.md](./quickstart.md)
- **Contracts**: [contracts/README.md](./contracts/README.md)
