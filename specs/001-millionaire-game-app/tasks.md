# Tasks: Who Wants to Be a Millionaire Game Application

**Feature**: 001-millionaire-game-app  
**Date**: 2025-12-14  
**Input**: Design documents from `specs/001-millionaire-game-app/`

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Tests**: Per Constitution III. No Testing Required - manual testing only against acceptance scenarios.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- All tasks include exact file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [ ] T001 Verify Angular CLI version 21+ and TypeScript 5.9+ installation
- [ ] T002 Install @ngbracket/ngx-layout for flexbox directives in package.json
- [ ] T003 [P] Install zod for schema validation in package.json
- [ ] T004 [P] Verify Angular Material and CDK are installed in package.json
- [ ] T005 [P] Verify TypeScript strict mode enabled in tsconfig.json
- [ ] T006 [P] Create directory structure: src/app/models, src/app/services, src/app/host, src/app/seat, src/app/shared
- [ ] T007 [P] Configure Angular Material custom theme in src/styles.scss with gold/blue dramatic palette

**Checkpoint**: Project structure ready, dependencies installed

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core models, types, and base services that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Core Type Definitions

- [ ] T008 [P] Create ChoiceKey type ('A' | 'B' | 'C' | 'D') in src/app/models/choice-key.model.ts
- [ ] T009 [P] Create Difficulty type ('easy' | 'medium' | 'hard') in src/app/models/choice-key.model.ts
- [ ] T010 [P] Create LifelineType type ('fiftyFifty' | 'askAudience' | 'phoneFriend') in src/app/models/choice-key.model.ts
- [ ] T011 [P] Create GamePhase enum (SETUP, QUESTION, FINAL_LOCKED, REVEAL, BETWEEN, ENDED) in src/app/models/game-phase.model.ts

### Question Models

- [ ] T012 [P] Create Choice interface in src/app/models/question.model.ts
- [ ] T013 [P] Create Question interface in src/app/models/question.model.ts
- [ ] T014 [P] Create QuestionPack interface with validation rules in src/app/models/question.model.ts

### Money Ladder Models

- [ ] T015 [P] Create LadderLevel interface in src/app/models/money-ladder.model.ts
- [ ] T016 [P] Create MoneyLadder interface in src/app/models/money-ladder.model.ts
- [ ] T017 [P] Create createDefaultLadder() function with classic US Millionaire values in src/app/models/money-ladder.model.ts

### Lifeline Models

- [ ] T018 [P] Create FiftyFiftyState interface in src/app/models/lifeline.model.ts
- [ ] T019 [P] Create AskAudienceState and AudiencePercentages interfaces in src/app/models/lifeline.model.ts
- [ ] T020 [P] Create PhoneFriendState interface in src/app/models/lifeline.model.ts
- [ ] T021 [P] Create LifelineState interface and createDefaultLifelines() function in src/app/models/lifeline.model.ts

### Timer and State Models

- [ ] T022 [P] Create TimerState interface in src/app/models/timer.model.ts
- [ ] T023 Create GameState interface with all fields in src/app/models/game-state.model.ts
- [ ] T024 Create createDefaultGameState() function in src/app/models/game-state.model.ts
- [ ] T025 Create calculateWinnings() utility function in src/app/models/game-state.model.ts

### Sync Event Models

- [ ] T026 [P] Create SyncEvent discriminated union type with 12 event types in src/app/models/sync-event.model.ts

### Core Services

- [ ] T027 Create SyncService with BroadcastChannel in src/app/services/sync.service.ts
- [ ] T028 Create GameStateService with state management and sync integration in src/app/services/game-state.service.ts
- [ ] T029 [P] Create QuestionPackService with JSON import and Zod validation in src/app/services/question-pack.service.ts
- [ ] T030 [P] Create LadderConfigService with localStorage persistence in src/app/services/ladder-config.service.ts

**Checkpoint**: Foundation ready - all models, types, and core services complete. User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Host Controls Basic Game Flow (Priority: P1) 🎯 MVP

**Goal**: Enable host to load questions, present them to contestant, accept answer selection, reveal correct/incorrect outcome, and advance through money ladder or end game appropriately.

**Independent Test**: Load a question pack, start at level 1, select correct answers through multiple levels, verify ladder advances. Test incorrect answer resulting in game end with safe haven payout.

**Acceptance Criteria**:
- Host can click "Start Question" and question appears on both displays
- Host can select contestant's choice and click "Lock Final Answer"
- Host can click "Reveal" to show correct answer and outcome
- Ladder advances on correct answer, game ends on incorrect answer with safe haven winnings
- Contestant on level 15 answering correctly wins maximum prize

### Host UI Components for User Story 1

- [ ] T031 [P] [US1] Create HostLayoutComponent as route component for /host in src/app/host/host-layout/host-layout.component.ts
- [ ] T032 [P] [US1] Create GameSetupComponent with contestant name input, pack selector, Start Game button in src/app/host/game-setup/game-setup.component.ts
- [ ] T033 [P] [US1] Create QuestionControlComponent with question display, choice selection, Lock Final Answer, and Reveal buttons in src/app/host/question-control/question-control.component.ts
- [ ] T033a [US1] Display optional explanation/notes field in QuestionControlComponent for host-only visibility (FR-021)
- [ ] T034 [P] [US1] Create HostLadderComponent displaying 15 levels with current/cleared highlighting in src/app/host/host-ladder/host-ladder.component.ts

### Shared Components for User Story 1

- [ ] T035 [P] [US1] Create AnswerChoicesComponent with visual states (neutral, selected, locked, revealed correct/incorrect) in src/app/shared/answer-choices/answer-choices.component.ts

### Host Logic Integration for User Story 1

- [ ] T036 [US1] Implement startQuestion() method in GameStateService triggering QUESTION_STARTED event
- [ ] T037 [US1] Implement selectChoice() method in GameStateService triggering CHOICE_SELECTED event
- [ ] T038 [US1] Implement lockFinalAnswer() method in GameStateService triggering FINAL_LOCKED event
- [ ] T039 [US1] Implement revealAnswer() method in GameStateService triggering REVEAL_SHOWN event
- [ ] T040 [US1] Implement advanceLevel() method in GameStateService triggering LEVEL_ADVANCED event
- [ ] T041 [US1] Implement endGame() method in GameStateService triggering GAME_ENDED event with winnings calculation (validate: non-negative integer; if no safe haven reached, winnings = 0)
- [ ] T041a [P] [US1] Create GameEndSummaryComponent displaying final winnings, questions cleared, lifelines used, and highest safe haven reached (FR-010) in src/app/shared/game-end-summary/game-end-summary.component.ts

### Host UI Styling for User Story 1

- [ ] T042 [US1] Style HostLayoutComponent with Material Design panels and ngx-layout flexbox in src/app/host/host-layout/host-layout.component.scss
- [ ] T043 [US1] Style QuestionControlComponent with clear question display and control buttons in src/app/host/question-control/question-control.component.scss
- [ ] T044 [US1] Style HostLadderComponent with level highlighting and safe haven indicators in src/app/host/host-ladder/host-ladder.component.scss

**Checkpoint**: At this point, User Story 1 (host controls) should be fully functional and testable independently. Host UI complete but seat display not yet implemented.

---

## Phase 4: User Story 2 - Dual-Display Synchronization (Priority: P1) 🎯 MVP

**Goal**: Display game on two separate screens (host control and contestant/audience viewing) with perfect real-time synchronization via BroadcastChannel, including reconnection support.

**Independent Test**: Open host UI in one window, open contestant UI in popup, verify all host actions (question start, answer lock, reveal) appear instantly on contestant display without delay. Close and reopen contestant display to verify state sync.

**Acceptance Criteria**:
- Host can trigger "Open Contestant Display" and popup opens at /seat
- Contestant display updates within 100ms of host actions
- Contestant display closed/refreshed automatically reconnects and syncs current state
- Connection status indicator shows connected/disconnected state on host UI

### Seat UI Components for User Story 2

- [ ] T045 [P] [US2] Create SeatLayoutComponent as route component for /seat with second-screen optimized layout in src/app/seat/seat-layout/seat-layout.component.ts
- [ ] T046 [P] [US2] Create QuestionDisplayComponent (seat) with read-only question and choices display in src/app/seat/question-display/question-display.component.ts
- [ ] T047 [P] [US2] Create SeatLadderComponent with vertical dramatic styling for 1080p/4K display in src/app/seat/seat-ladder/seat-ladder.component.ts
- [ ] T048 [P] [US2] Create LifelineStatusComponent showing 3 lifeline icons with availability status in src/app/seat/lifeline-status/lifeline-status.component.ts

### Seat Sync Logic for User Story 2

- [ ] T049 [US2] Implement BroadcastChannel event listener in SeatLayoutComponent subscribing to sync events
- [ ] T050 [US2] Implement STATE_SYNC_REQUEST message on seat component initialization in SeatLayoutComponent
- [ ] T051 [US2] Implement STATE_SYNC_RESPONSE handler in GameStateService to send full state snapshot to seat
- [ ] T052 [US2] Implement local state reconstruction from sync events in SeatLayoutComponent

### Host-Seat Integration for User Story 2

- [ ] T053 [US2] Implement openSeatDisplay() method in HostLayoutComponent using window.open() with fullscreen features
- [ ] T054 [US2] Create ConnectionStatusComponent showing seat display connection state in src/app/shared/connection-status/connection-status.component.ts
- [ ] T055 [US2] Implement connection status polling with interval check on seatWindow.closed in HostLayoutComponent
- [ ] T056 [US2] Add "Open Contestant Display" button to GameSetupComponent triggering openSeatDisplay()

### Seat UI Styling for User Story 2

- [ ] T057 [US2] Style SeatLayoutComponent with show-style dramatic theme (gold/blue palette) in src/app/seat/seat-layout/seat-layout.component.scss
- [ ] T058 [US2] Style SeatLadderComponent with large text, pulsing current level effect, animations in src/app/seat/seat-ladder/seat-ladder.component.scss
- [ ] T059 [US2] Style QuestionDisplayComponent (seat) with large readable text optimized for second screen in src/app/seat/question-display/question-display.component.scss
- [ ] T060 [US2] Create reveal sequence animations using Angular @angular/animations in src/app/seat/question-display/question-display.component.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Host can control game, seat display synchronizes in real-time.

---

## Phase 5: User Story 3 - Walk Away Option (Priority: P2)

**Goal**: Enable contestant to walk away before locking final answer, keeping current guaranteed winnings from last cleared level.

**Independent Test**: Reach any level above 1, trigger "Walk Away" before locking answer, verify game ends with contestant keeping last cleared level winnings.

**Acceptance Criteria**:
- Host can click "Walk Away" before locking final answer
- Game ends showing contestant walked away with correct last cleared level winnings
- Walk Away disabled once final answer is locked
- Display shows walk away status on both host and seat

### Implementation for User Story 3

- [ ] T061 [P] [US3] Create AdminPanelComponent with Walk Away button in src/app/host/admin-panel/admin-panel.component.ts
- [ ] T062 [US3] Implement walkAway() method in GameStateService triggering WALK_AWAY event with winnings calculation
- [ ] T063 [US3] Add walk away button state management (disabled if answer locked) in AdminPanelComponent
- [ ] T064 [US3] Update QuestionControlComponent to disable walk away button after final answer locked
- [ ] T065 [US3] Update SeatLayoutComponent to display walk away message on WALK_AWAY event
- [ ] T066 [US3] Style AdminPanelComponent with clear walk away button styling in src/app/host/admin-panel/admin-panel.component.scss

**Checkpoint**: User Story 3 complete. Host can trigger walk away, game ends with correct winnings calculation.

---

## Phase 6: User Story 4 - 50:50 Lifeline (Priority: P2)

**Goal**: Enable contestant to use 50:50 lifeline to remove two incorrect answers, leaving correct answer and one incorrect answer visible.

**Independent Test**: Start a question, activate 50:50 from host UI, verify exactly two incorrect answers are removed/grayed out on both displays.

**Acceptance Criteria**:
- Host activates 50:50 lifeline, two incorrect answers removed/grayed out
- 50:50 shows as "Used" after activation and cannot be used again
- Game continues normally with reveal showing correct/incorrect outcome
- Lifeline disabled once final answer locked

### Implementation for User Story 4

- [ ] T067 [P] [US4] Create LifelineControlComponent with 50:50 button in src/app/host/lifeline-control/lifeline-control.component.ts
- [ ] T068 [US4] Implement useFiftyFifty() method in GameStateService with random removal of two incorrect choices
- [ ] T069 [US4] Add LIFELINE_USED event emission with type 'fiftyFifty' and removedChoices data in GameStateService
- [ ] T070 [US4] Update AnswerChoicesComponent to display removed choices state (grayed out) based on removedChoices input
- [ ] T071 [US4] Update LifelineStatusComponent (seat) to show 50:50 used state and display removed choices
- [ ] T072 [US4] Update LifelineControlComponent to disable 50:50 button after use or if answer locked
- [ ] T073 [US4] Style LifelineControlComponent with Material buttons and used/available states in src/app/host/lifeline-control/lifeline-control.component.scss

**Checkpoint**: User Story 4 complete. 50:50 lifeline functional on host and seat displays.

---

## Phase 7: User Story 5 - Ask the Audience Lifeline (Priority: P2)

**Goal**: Enable contestant to see audience voting percentages for each answer choice to help guide their decision.

**Independent Test**: Start question, activate Ask the Audience, enter percentage values (must sum to 100), verify bar chart/percentage display appears on contestant screen.

**Acceptance Criteria**:
- Host activates Ask the Audience and enters percentages for each choice
- Validation error if percentages don't sum to 100
- Contestant display shows bar chart or percentage breakdown
- If 50:50 used first, percentages display only for remaining choices
- Lifeline shows as "Used" after activation

### Implementation for User Story 5

- [ ] T074 [P] [US5] Add Ask the Audience button to LifelineControlComponent in src/app/host/lifeline-control/lifeline-control.component.ts
- [ ] T075 [P] [US5] Create AudiencePercentagesDialogComponent with 4 input fields (A, B, C, D) and sum validation in src/app/host/audience-percentages-dialog/audience-percentages-dialog.component.ts
- [ ] T076 [US5] Implement useAskAudience() method in GameStateService with LIFELINE_USED event emission
- [ ] T077 [US5] Add validation logic for percentage sum equals 100 and disable input fields for removed choices if 50:50 used (FR-032) in AudiencePercentagesDialogComponent
- [ ] T078 [US5] Update LifelineStatusComponent (seat) to display bar chart with audience percentages using Material progress bars
- [ ] T079 [US5] Update LifelineControlComponent to disable Ask the Audience button after use or if answer locked
- [ ] T080 [US5] Handle 50:50 integration - show percentages only for remaining choices if 50:50 used first in LifelineStatusComponent
- [ ] T081 [US5] Style AudiencePercentagesDialogComponent with Material dialog styling in src/app/host/audience-percentages-dialog/audience-percentages-dialog.component.scss
- [ ] T082 [US5] Style bar chart display in LifelineStatusComponent with show-style dramatic effect in src/app/seat/lifeline-status/lifeline-status.component.scss

**Checkpoint**: User Story 5 complete. Ask the Audience lifeline functional with percentage validation and bar chart display.

---

## Phase 8: User Story 6 - Phone a Friend Lifeline (Priority: P3)

**Goal**: Enable contestant to receive a suggestion from a "friend" (entered by host), optionally with countdown timer.

**Independent Test**: Start question, activate Phone a Friend, optionally start timer, enter friend's suggestion, verify suggestion and timer appear on contestant display.

**Acceptance Criteria**:
- Host activates Phone a Friend, optional countdown timer starts
- Host enters friend's suggestion text
- Suggestion and timer display on contestant screen
- Timer reaches 0 shows "Time's Up" but host can still enter/reveal suggestion
- Lifeline shows as "Used" after activation

### Implementation for User Story 6

- [ ] T083 [P] [US6] Add Phone a Friend button to LifelineControlComponent in src/app/host/lifeline-control/lifeline-control.component.ts
- [ ] T084 [P] [US6] Create PhoneFriendDialogComponent with suggestion input and optional timer controls in src/app/host/phone-friend-dialog/phone-friend-dialog.component.ts
- [ ] T085 [P] [US6] Create TimerComponent with countdown display (MM:SS format) in src/app/shared/timer/timer.component.ts
- [ ] T086 [US6] Implement usePhoneFriend() method in GameStateService with LIFELINE_USED event emission
- [ ] T087 [US6] Implement RxJS interval timer in GameStateService with TIMER_TICK events (1/second)
- [ ] T088 [US6] Implement timer expiration logic with TIMER_EXPIRED event in GameStateService
- [ ] T089 [US6] Update LifelineStatusComponent (seat) to display friend suggestion text and timer countdown
- [ ] T090 [US6] Update LifelineControlComponent to disable Phone a Friend button after use or if answer locked
- [ ] T091 [US6] Style PhoneFriendDialogComponent with Material dialog styling in src/app/host/phone-friend-dialog/phone-friend-dialog.component.scss
- [ ] T092 [US6] Style TimerComponent with large countdown display in src/app/shared/timer/timer.component.scss

**Checkpoint**: User Story 6 complete. All three lifelines functional.

---

## Phase 9: User Story 7 - Question Timer (Priority: P3)

**Goal**: Optionally enable countdown timer for each question to add time pressure, displaying on both screens.

**Independent Test**: Enable question timer in setup (e.g., 60 seconds), start question, verify countdown displays on both screens, counts down in real-time, shows "Time's Up" at 0 without forcing answer.

**Acceptance Criteria**:
- Question timer enabled in game setup with configurable duration
- Both displays show countdown starting at configured duration
- Timer updates every second on both displays
- Timer reaches 0 shows "Time's Up" but game continues normally
- Host retains full control after timer expires

### Implementation for User Story 7

- [ ] T093 [P] [US7] Add question timer configuration to GameSetupComponent (enable checkbox, duration input) in src/app/host/game-setup/game-setup.component.ts
- [ ] T094 [US7] Update GameState model to include questionTimer field in src/app/models/game-state.model.ts
- [ ] T095 [US7] Implement startQuestionTimer() method in GameStateService with RxJS interval and TIMER_TICK events
- [ ] T096 [US7] Add TimerComponent instance to HostLayoutComponent displaying question timer in header
- [ ] T097 [US7] Add TimerComponent instance to SeatLayoutComponent displaying question timer in prominent position
- [ ] T098 [US7] Update QuestionControlComponent to start/stop question timer on question start/reveal
- [ ] T099 [US7] Add pause, resume, and reset buttons to AdminPanelComponent for all active timers (question timer and Phone Friend timer) with clear visual state indicators
- [ ] T100 [US7] Style timer display with "Time's Up" warning state in TimerComponent styling

**Checkpoint**: User Story 7 complete. Question timer functional on both displays with host controls.

---

## Phase 10: User Story 8 - Custom Question Pack Import (Priority: P2)

**Goal**: Enable game operator to import custom question packs in JSON format with validation, allowing themed games and custom content.

**Independent Test**: Create valid JSON question pack file with 15 questions, import through host UI, verify all questions load correctly and can be played through in sequence.

**Acceptance Criteria**:
- Host imports question pack JSON file through setup UI
- Question pack loads successfully if valid
- Validation warnings appear for invalid data with specific issues listed
- Multiple question packs can be imported and selected
- Optional fields (category, difficulty, explanations) display correctly on host

### Implementation for User Story 8

- [ ] T101 [P] [US8] Create Zod schema matching question-pack.schema.json in src/app/services/question-pack.service.ts
- [ ] T102 [P] [US8] Create sample-questions.json with 15 valid questions in public/sample-questions.json
- [ ] T103 [US8] Implement importPack() method with Zod validation in QuestionPackService
- [ ] T104 [US8] Implement validatePack() method with detailed error reporting in QuestionPackService
- [ ] T105 [US8] Implement savePack() method with localStorage persistence in QuestionPackService
- [ ] T106 [US8] Implement loadPack() and listPacks() methods in QuestionPackService
- [ ] T107 [US8] Add file upload control to GameSetupComponent with validation error display
- [ ] T108 [US8] Add question pack dropdown selector to GameSetupComponent showing all imported packs
- [ ] T109 [US8] Display optional question fields (category, difficulty, explanation) in QuestionControlComponent for host view
- [ ] T110 [US8] Add validation error dialog component showing specific validation issues
- [ ] T111 [US8] Style file upload and pack selector in GameSetupComponent with Material form controls

**Checkpoint**: User Story 8 complete. Custom question pack import functional with validation and persistence.

---

## Phase 11: User Story 9 - Money Ladder Configuration (Priority: P3)

**Goal**: Enable game operator to customize money ladder values and safe haven positions for different game formats.

**Independent Test**: Access game setup, modify ladder values (e.g., change level 10 to $50,000), adjust safe haven positions (e.g., levels 5 and 12), verify custom values display correctly and are used for winnings calculations.

**Acceptance Criteria**:
- Host modifies money ladder values for each of 15 levels in setup
- Custom ladder values saved and displayed during gameplay
- Winnings calculated using custom safe haven amounts
- Safe haven positions customizable (e.g., levels 6 and 12 instead of 5 and 10)
- Ladder display visually indicates new safe haven positions

### Implementation for User Story 9

- [ ] T112 [P] [US9] Create LadderConfigDialogComponent with 15 value inputs and safe haven checkboxes in src/app/host/ladder-config-dialog/ladder-config-dialog.component.ts
- [ ] T113 [US9] Implement saveConfig() method in LadderConfigService with localStorage persistence
- [ ] T114 [US9] Implement loadConfig() method in LadderConfigService loading custom ladder or default
- [ ] T115 [US9] Implement resetToDefault() method in LadderConfigService
- [ ] T116 [US9] Add "Configure Ladder" button to GameSetupComponent opening LadderConfigDialogComponent
- [ ] T117 [US9] Update calculateWinnings() function to use custom safe haven positions from ladder config
- [ ] T118 [US9] Update HostLadderComponent to visually indicate custom safe haven positions
- [ ] T119 [US9] Update SeatLadderComponent to visually indicate custom safe haven positions
- [ ] T120 [US9] Add ladder value validation (positive integers, monotonically increasing warning) in LadderConfigDialogComponent
- [ ] T121 [US9] Style LadderConfigDialogComponent with Material form controls and table layout in src/app/host/ladder-config-dialog/ladder-config-dialog.component.scss

**Checkpoint**: User Story 9 complete. All user stories (P1, P2, P3) now independently functional.

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final production readiness

### Navigation Guards & State Persistence

- [ ] T122 [P] Implement Angular CanDeactivate guard for HostLayoutComponent warning before route navigation during active game (phases other than SETUP/ENDED) in src/app/guards/unsaved-changes.guard.ts
- [ ] T122a [P] Implement beforeunload event handler in HostLayoutComponent warning on browser close/refresh during active game (FR-043)
- [ ] T123 [P] Implement sessionStorage backup for game state on host in GameStateService
- [ ] T124 [P] Implement sessionStorage restoration on host reload in GameStateService

### Error Handling & User Feedback

- [ ] T125 [P] Add global error handler for BroadcastChannel failures in src/app/services/sync.service.ts
- [ ] T126 [P] Add user-friendly error messages for question pack validation failures with specific issue details
- [ ] T127 [P] Add loading indicators for question pack import and validation operations

### Accessibility & UX Improvements

- [ ] T128 [P] Add ARIA labels and roles to all interactive components for screen reader support
- [ ] T129 [P] Add keyboard navigation support (Tab, Enter) for all host controls
- [ ] T130 [P] Add focus management for dialog components (Material dialogs handle this by default)

### Admin Controls Completion

- [ ] T131 [P] Add "Override Current Level" dropdown to AdminPanelComponent for host adjustments
- [ ] T132 [P] Add "Reset Lifelines" checkboxes to AdminPanelComponent for lifeline state override
- [ ] T133 [P] Add "End Game" button to AdminPanelComponent for immediate game termination
- [ ] T134 [P] Add "Reset Game" button to AdminPanelComponent returning to SETUP phase

### Documentation & Validation

- [ ] T135 [P] Update README.md with setup instructions, dependency installation, and run commands
- [ ] T136 [P] Create quickstart validation checklist based on quickstart.md acceptance scenarios
- [ ] T137 [P] Test all acceptance scenarios from spec.md manually for each user story
- [ ] T138 [P] Test seat display on 1080p and 4K screens for readability and visual quality

### Performance & Optimization

- [ ] T139 [P] Verify OnPush change detection strategy on all components for optimal performance
- [ ] T140 [P] Test synchronization latency (should be <100ms) with performance profiling
- [ ] T141 [P] Optimize Angular animations for 60fps on seat display reveal sequences

**Final Checkpoint**: All user stories complete, application production-ready, all acceptance scenarios validated

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion - MVP core functionality
- **User Story 2 (Phase 4)**: Depends on Foundational completion and integrates with US1 - MVP dual display
- **User Story 3 (Phase 5)**: Depends on Foundational and US1/US2 completion (uses GameStateService, displays on seat)
- **User Story 4-6 (Phases 6-8)**: Depend on Foundational and US1/US2 (lifelines require question flow and sync)
- **User Story 7 (Phase 9)**: Depends on Foundational and US1/US2 (timer integrates with question flow)
- **User Story 8 (Phase 10)**: Depends on Foundational (uses QuestionPackService) - can run in parallel with other stories
- **User Story 9 (Phase 11)**: Depends on Foundational (uses LadderConfigService) - can run in parallel with other stories
- **Polish (Phase 12)**: Depends on all desired user stories being complete

### User Story Independence

- **US1 + US2 (P1)**: Form MVP core - must be implemented together for functional game
- **US3 (P2)**: Independent increment after MVP - walk away feature
- **US4-6 (P2)**: Three lifelines can be implemented in parallel by different developers after MVP
- **US7 (P3)**: Independent increment - timer feature
- **US8 (P2)**: Independent increment - can be implemented in parallel with other stories
- **US9 (P3)**: Independent increment - can be implemented in parallel with other stories

### Suggested MVP Delivery Order

**MVP 1.0** (Minimum Playable Game):
1. Phase 1: Setup
2. Phase 2: Foundational
3. Phase 3: User Story 1 (Host Controls)
4. Phase 4: User Story 2 (Dual Display Sync)
- **Result**: Playable game with question flow, ladder, and synchronized displays

**MVP 1.1** (Essential Features):
5. Phase 5: User Story 3 (Walk Away)
6. Phase 10: User Story 8 (Custom Question Packs)
- **Result**: Complete gameplay with strategic options and custom content

**MVP 1.2** (Enhanced Gameplay):
7. Phase 6: User Story 4 (50:50 Lifeline)
8. Phase 7: User Story 5 (Ask the Audience)
9. Phase 8: User Story 6 (Phone a Friend)
- **Result**: Full game show experience with all lifelines

**MVP 1.3** (Advanced Features):
10. Phase 9: User Story 7 (Question Timer)
11. Phase 11: User Story 9 (Ladder Configuration)
- **Result**: Fully customizable game experience

**Production 1.0**:
12. Phase 12: Polish & Cross-Cutting Concerns
- **Result**: Production-ready application

### Parallel Opportunities

**During Foundational Phase (Phase 2)**:
- All model creation tasks (T008-T026) can run in parallel - different files
- Service creation tasks (T027-T030) can run in parallel AFTER models complete

**After Foundational Complete**:
- User Stories with minimal dependencies can be worked on in parallel by different developers:
  - US1 + US2 together (core MVP)
  - US8 independently (question pack service separate from game flow)
  - US9 independently (ladder config separate from game flow)

**Within User Story 1**:
- All component creation tasks (T031-T035) can run in parallel - different files
- Logic integration tasks (T036-T041) must be sequential (same service file)
- Styling tasks (T042-T044) can run in parallel AFTER components exist

**Within User Story 2**:
- All seat component creation tasks (T045-T048) can run in parallel - different files
- Sync logic tasks (T049-T052) can be done independently
- Host-seat integration tasks (T053-T056) can be done after components exist
- Styling tasks (T057-T060) can run in parallel AFTER components exist

**Lifelines (US4-6)**:
- Can be implemented in parallel by different developers
- Each is independent implementation pattern: component → service method → sync → display

**Polish Phase (Phase 12)**:
- Most tasks are independent and can run in parallel (different concerns)

---

## Parallel Example: MVP Implementation

```bash
# After Foundational phase complete, launch MVP work:

# Developer A: User Story 1 - Host Controls
Task T031: Create HostLayoutComponent
Task T032: Create GameSetupComponent
Task T033: Create QuestionControlComponent
Task T034: Create HostLadderComponent
Task T035: Create AnswerChoicesComponent
... (continue with US1 tasks)

# Developer B: User Story 2 - Seat Display (can start in parallel)
Task T045: Create SeatLayoutComponent
Task T046: Create QuestionDisplayComponent
Task T047: Create SeatLadderComponent
Task T048: Create LifelineStatusComponent
... (continue with US2 tasks)

# Both developers integrate at sync layer (coordinate on T049-T056)
```

---

## Implementation Strategy Summary

### Phase Progression

1. **Setup**: Project and dependencies ready (~30 minutes)
2. **Foundational**: Models, types, services complete (~4-6 hours)
3. **MVP (US1+US2)**: Host + Seat basic game flow (~8-12 hours)
4. **Essential (US3+US8)**: Walk away + Custom packs (~3-4 hours)
5. **Lifelines (US4-6)**: All three lifelines (~6-8 hours)
6. **Advanced (US7+US9)**: Timer + Ladder config (~3-4 hours)
7. **Polish**: Production readiness (~2-3 hours)

**Total Estimated Effort**: 26-40 hours for complete implementation

### Validation Checkpoints

- After Phase 2: Verify all TypeScript interfaces compile without errors
- After Phase 3: Test host can load pack, start questions, reveal answers, advance ladder
- After Phase 4: Test seat display opens, syncs in real-time, reconnects after close
- After Phase 5: Test walk away calculates correct winnings
- After Phases 6-8: Test each lifeline individually
- After Phase 9: Test question timer countdown and expiration
- After Phase 10: Import malformed JSON and verify validation catches errors
- After Phase 11: Modify ladder values and verify custom calculations
- After Phase 12: Run all acceptance scenarios from spec.md

### Task Completion Criteria

Each task is considered complete when:
- Code compiles without TypeScript errors
- Component/service implements all specified functionality
- Visual styling matches show-style UX requirements (for UI tasks)
- Manual testing verifies acceptance criteria (at checkpoint level)
- Code follows Angular 21+ best practices (standalone components, signals where appropriate, OnPush change detection)

---

## Notes

- **[P] tasks**: Different files with no dependencies - can be parallelized
- **[Story] labels**: Map tasks to specific user stories for traceability and independent testing
- **File paths**: All tasks include explicit file paths for clarity
- **Constitution compliance**: No automated tests per constitution (III), manual validation only
- **TypeScript strict mode**: All code must compile with strict mode enabled
- **Angular best practices**: Use standalone components, signals for local state, RxJS for streams
- **Show-style UX**: Seat display optimized for 1080p/4K with dramatic gold/blue theming
- **BroadcastChannel**: Single-origin constraint documented in quickstart.md

---

**Total Tasks**: 141 tasks across 12 phases
**MVP Scope**: Phases 1-4 (Tasks T001-T060) = 60 tasks for minimum viable game
**Full Implementation**: All 141 tasks for complete feature-rich application
