# Feature Specification: Who Wants to Be Rich Game Application

**Feature Branch**: `001-rich-game-app`  
**Created**: 2025-12-14  
**Status**: Draft  
**Input**: User description: "Build an Angular 21+ single-page app that runs a Who Wants to Be Rich-style game in a browser with two synchronized UIs"

## Clarifications

### Session 2025-12-14

- Q: The 50:50 lifeline spec says it removes "two incorrect answers" but doesn't specify the selection method when there are three incorrect answers to choose from. → A: Remove two incorrect answers randomly from the three available (random selection)
- Q: When a contestant walks away from a question they haven't answered yet, what winnings do they receive? → A: Contestant receives winnings from the last successfully cleared level (the highest level they answered correctly). Example: If contestant is ON level 7 (viewing level 7 question, not yet answered), they walked away with level 6 winnings ($16,000). If ON level 5, they get level 4 winnings ($1,000).
- Q: The Question Pack JSON format specification mentions support for optional media fields (image/audio/video), but doesn't specify how these media assets should be referenced or loaded. → A: Media fields contain URLs (http/https or file:// paths) to external media files
- Q: The specification states that default money ladder uses "US dollar values typical of game show format" but doesn't specify what those exact default values are for each of the 15 levels. → A: Use classic game show ladder progression - $100, $200, $300, $500, $1K, $2K, $4K, $8K, $16K, $32K, $64K, $125K, $250K, $500K, $1M
- Q: The spec mentions that the contestant display popup can be "closed or refreshed" and should reconnect with full state sync. However, it doesn't specify whether the host should receive any notification when the contestant display disconnects or reconnects. → A: Visual indicator showing connection status (connected/disconnected) without modal dialogs or blocking popups

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Host Controls Basic Game Flow (Priority: P1)

A game host needs to load questions, present them to a contestant, accept their answer selection, reveal whether it's correct, and advance through the money ladder or end the game appropriately.

**Why this priority**: This is the core game mechanic - without this, there is no playable game. All other features depend on this baseline functionality.

**Independent Test**: Can be fully tested by loading a question pack, starting at level 1, selecting correct answers through multiple levels, and verifying the ladder advances. Can also test incorrect answer resulting in game end with safe haven payout.

**Acceptance Scenarios**:

1. **Given** a question pack is loaded and the game is in setup, **When** the host clicks "Start Question", **Then** the current question with 4 answer choices (A-D) appears on both host and contestant displays, and the money ladder shows the current level highlighted
2. **Given** a question is displayed and the contestant has indicated their choice, **When** the host selects that choice and clicks "Lock Final Answer", **Then** both displays show the "Final Answer" locked state with the chosen answer highlighted
3. **Given** a final answer is locked, **When** the host clicks "Reveal", **Then** the correct answer is highlighted, the outcome (correct/incorrect) is displayed, and if correct the ladder advances to the next level with updated winnings
4. **Given** an incorrect answer is revealed on level 8, **When** the reveal completes, **Then** the game ends and displays the contestant's winnings equal to the last safe haven amount (level 5 default)
5. **Given** the contestant is on level 15 and answers correctly, **When** the reveal completes, **Then** the game ends showing the contestant has won the maximum prize amount

---

### User Story 2 - Dual-Display Synchronization (Priority: P1)

A game operator needs to display the game on two separate screens - one for host control and one for contestant/audience viewing - with both screens staying perfectly synchronized in real-time without requiring manual refresh or reconnection.

**Why this priority**: The dual-display requirement is a fundamental aspect of this game show format. Without reliable synchronization, the game cannot be run as intended, making this equally critical to P1.

**Independent Test**: Can be tested by opening the host UI in one window, opening the contestant UI in a popup window, and verifying that all actions taken in the host UI (question start, answer lock, reveal) appear instantly on the contestant display without delay or need for manual refresh.

**Acceptance Scenarios**:

1. **Given** the host UI is open at `/host`, **When** the host triggers the "Open Contestant Display" action, **Then** a new popup window opens showing `/seat` and displays the current game state (ladder, level, question if active)
2. **Given** both displays are open and the host starts a question, **When** the question appears on the host display, **Then** the contestant display updates within 100ms showing the same question text and answer choices
3. **Given** both displays are active and the host locks a final answer, **When** the final answer state is triggered on the host, **Then** the contestant display updates immediately showing the locked answer highlighted
4. **Given** the contestant display is closed or refreshed, **When** it reopens or reload completes, **Then** it automatically requests and receives the current game state and displays the correct question, ladder position, and lifeline status
5. **Given** both displays are showing the reveal sequence, **When** the correct answer is revealed on the host, **Then** the contestant display shows the exact same reveal animation and outcome simultaneously
6. **Given** the contestant display is open and connected, **When** the display disconnects (closed/network issue), **Then** the host UI shows a visual indicator (e.g., "Display: Disconnected") without blocking alerts, and updates to "Display: Connected" when reconnection occurs

---

### User Story 3 - Walk Away Option (Priority: P2)

A contestant needs the ability to walk away from the game before locking in a final answer, keeping their current guaranteed winnings from the last cleared level, as per standard game show rules.

**Why this priority**: This is a key strategic element of the game that affects gameplay decisions, but the game is still playable without it. It should be implemented early but is not required for the absolute minimum viable game.

**Independent Test**: Can be tested independently by reaching any level above 1, having the host trigger "Walk Away" before locking a final answer, and verifying the game ends with the contestant keeping their current cleared level winnings.

**Acceptance Scenarios**:

1. **Given** the contestant is on level 7 with $16,000 cleared (level 6 winnings), **When** the host clicks "Walk Away" before locking a final answer, **Then** the game ends showing the contestant walked away with $16,000 (last successfully cleared level)
2. **Given** the contestant is on level 5 (first safe haven) but has not yet answered the level 5 question, **When** the host clicks "Walk Away", **Then** the game ends showing winnings of $1,000 (level 4 cleared amount, as level 5 has not been answered)
3. **Given** a final answer has been locked but not yet revealed, **When** the host attempts to trigger "Walk Away", **Then** the walk away option is disabled/unavailable since the final answer is already committed

---

### User Story 4 - 50:50 Lifeline (Priority: P2)

A contestant needs to use the 50:50 lifeline to remove two incorrect answer choices, leaving only the correct answer and one incorrect answer visible, making the question easier to solve.

**Why this priority**: Lifelines are signature features of the game format and significantly enhance gameplay, but the core game is functional without them. Should be implemented after core mechanics are solid.

**Independent Test**: Can be tested independently by starting a question, activating 50:50 from the host UI, and verifying that exactly two incorrect answers are removed/grayed out on both displays, leaving the correct answer and one incorrect answer visible.

**Acceptance Scenarios**:

1. **Given** a question is displayed with 4 choices and 50:50 lifeline is available, **When** the host activates the 50:50 lifeline, **Then** two incorrect answers are removed/grayed out on both displays, leaving only the correct answer and one incorrect answer visible
2. **Given** the 50:50 lifeline has been used once, **When** a new question is presented, **Then** the 50:50 lifeline shows as "Used" and cannot be activated again for any subsequent questions
3. **Given** a question is displayed, **When** 50:50 is activated and then the contestant locks in a final answer from the remaining two choices, **Then** the game continues normally with reveal showing correct/incorrect outcome
4. **Given** a final answer has already been locked, **When** the host attempts to activate 50:50, **Then** the lifeline button is disabled/unavailable since the answer is already committed

---

### User Story 5 - Ask the Audience Lifeline (Priority: P2)

A contestant needs to use the Ask the Audience lifeline to see audience voting percentages for each answer choice, typically with the correct answer receiving the highest percentage, to help guide their decision.

**Why this priority**: Part of the classic lifeline trio and adds strategic depth to gameplay. Not essential for core functionality but important for complete game experience.

**Independent Test**: Can be tested independently by starting a question, activating Ask the Audience, having the host enter percentage values (must sum to 100), and verifying a bar chart/percentage display appears on the contestant screen showing the audience vote distribution.

**Acceptance Scenarios**:

1. **Given** a question is displayed and Ask the Audience is available, **When** the host activates Ask the Audience and enters percentages (e.g., A:45%, B:30%, C:15%, D:10%), **Then** the contestant display shows a bar chart or percentage breakdown for each answer choice
2. **Given** the host is entering audience percentages, **When** the values entered do not sum to 100, **Then** a validation error appears and the host must correct the values before proceeding
3. **Given** Ask the Audience has been used once, **When** the next question starts, **Then** the lifeline shows as "Used" and cannot be activated again
4. **Given** 50:50 was used first (leaving only 2 choices), **When** Ask the Audience is activated, **Then** the percentages display only for the two remaining choices (with removed choices showing 0% or hidden)

---

### User Story 6 - Phone a Friend Lifeline (Priority: P3)

A contestant needs to use the Phone a Friend lifeline to receive a suggestion from a "friend" (entered by the host), optionally with a countdown timer, to help them decide on an answer.

**Why this priority**: Completes the classic lifeline set but is the least interactive of the three. Can be added later without impacting core gameplay or other lifeline functionality.

**Independent Test**: Can be tested independently by starting a question, activating Phone a Friend, optionally starting a timer, having the host enter a friend's suggestion (e.g., "I think it's C"), and verifying the suggestion and timer appear on the contestant display.

**Acceptance Scenarios**:

1. **Given** a question is displayed and Phone a Friend is available, **When** the host activates Phone a Friend, **Then** the contestant display shows "Phone a Friend" is in progress and an optional countdown timer starts
2. **Given** Phone a Friend is active, **When** the host enters a friend's suggestion (e.g., "I'm pretty sure it's answer B"), **Then** the suggestion text appears on the contestant display
3. **Given** the phone timer is configured for 30 seconds and is running, **When** the timer reaches 0, **Then** the timer display shows "Time's Up" but the host can still enter or reveal the friend's suggestion
4. **Given** Phone a Friend has been used once, **When** subsequent questions are displayed, **Then** the lifeline shows as "Used" and cannot be activated again

---

### User Story 7 - Question Timer (Priority: P3)

A game host may optionally enable a countdown timer for each question to add time pressure, with the timer displaying on both screens and alerting when time expires without automatically forcing an answer.

**Why this priority**: This is an optional enhancement that adds tension but is not required for standard gameplay. Many game show formats run without strict time limits.

**Independent Test**: Can be tested independently by enabling the question timer in setup (e.g., 60 seconds), starting a question, and verifying the countdown displays on both screens, counts down in real-time, and shows a "Time's Up" indicator when reaching 0 without forcing an answer or ending the game.

**Acceptance Scenarios**:

1. **Given** the question timer is enabled for 45 seconds in game setup, **When** the host starts a question, **Then** both displays show a countdown timer starting at 45 seconds
2. **Given** the question timer is running, **When** each second elapses, **Then** both displays update the countdown synchronously showing the remaining time
3. **Given** the timer reaches 0 seconds, **When** time expires, **Then** both displays show "Time's Up" indicator but the host retains full control to accept an answer, use lifelines, or adjudicate the outcome
4. **Given** the timer has expired showing "Time's Up", **When** the host locks in a final answer and reveals, **Then** the game continues normally with no penalties for running out of time

---

### User Story 8 - Custom Question Pack Import (Priority: P2)

A game operator needs to import custom question packs in a defined format (JSON with validation), allowing them to create themed games, difficulty variations, or custom content while ensuring data quality through validation warnings.

**Why this priority**: Reusability and customization are important for long-term value, but the system can launch with a default/sample question pack. Should be implemented early to support various use cases.

**Independent Test**: Can be tested independently by creating a valid JSON question pack file with 15 questions (each with 4 choices, correct answer key, level assignments), importing it through the host UI, and verifying all questions load correctly and can be played through in sequence.

**Acceptance Scenarios**:

1. **Given** a valid question pack JSON file with 15 questions, **When** the host imports the file through the setup UI, **Then** the question pack loads successfully and appears as selectable in the game setup dropdown
2. **Given** a question pack is being imported, **When** the file contains invalid data (e.g., missing correct answer key, duplicate choice keys, non-contiguous levels), **Then** validation warnings appear listing specific issues but do not crash the application
3. **Given** multiple question packs have been imported, **When** the host is in game setup, **Then** a dropdown shows all available question packs and the host can select which one to use for the current game
4. **Given** a question pack contains optional fields (category, difficulty tags, explanations), **When** the pack is loaded and a question is displayed, **Then** the host sees the additional information (explanations) but the contestant display only shows the core question text and choices

---

### User Story 9 - Money Ladder Configuration (Priority: P3)

A game operator needs to customize the money ladder values and safe haven positions to support different game formats, prize amounts, or regional currency variations beyond the default 15-level structure.

**Why this priority**: Useful for customization and reusability but not essential for initial launch. Most games can use standard ladder values initially.

**Independent Test**: Can be tested independently by accessing the game setup, modifying the ladder values (e.g., changing level 10 from $32,000 to $50,000), adjusting safe haven positions (e.g., setting safe havens at levels 5 and 12), and verifying these custom values display correctly on the ladder and are used for winnings calculations.

**Acceptance Scenarios**:

1. **Given** the host is in game setup, **When** they modify the money ladder values for each of the 15 levels, **Then** the custom values are saved and displayed on the ladder during gameplay
2. **Given** custom ladder values are set, **When** a contestant answers incorrectly at level 8, **Then** their winnings are calculated using the custom safe haven amount (e.g., custom level 5 value) not default amounts
3. **Given** the host changes safe haven positions from levels 5 and 10 to levels 6 and 12, **When** the game is in progress, **Then** the ladder display visually indicates the new safe haven positions, and winnings calculations use these positions when a contestant answers incorrectly

---

### Edge Cases

- What happens when the contestant display loses connection or is closed accidentally mid-game?
  - System must allow reconnection and full state resync without losing game progress
- What happens when the host attempts to activate a lifeline that's already been used?
  - UI must disable/gray out used lifelines to prevent activation
- What happens when the host tries to reveal an answer before locking in a final answer?
  - System should prevent reveal until final answer is locked, or provide a clear warning
- What happens when a question pack has fewer than 15 questions?
  - System should validate and warn but allow gameplay up to the number of questions available
- What happens when the host navigates away or refreshes the browser during an active game?
  - System should warn about losing game state before allowing navigation/refresh
- What happens when Ask the Audience percentages are entered but don't sum to exactly 100?
  - System must validate and prevent proceeding until percentages total 100
- What happens when 50:50 is used on a question where two wrong answers have identical text?
  - System should randomly select which identical answer to remove (edge case for poorly designed questions)
- What happens when the host tries to use a lifeline after the final answer has been revealed?
  - All lifeline buttons must be disabled once reveal sequence starts
- What happens when multiple browser windows try to act as the host simultaneously?
  - System uses BroadcastChannel which is single-origin, so only one browser profile can host; multiple profiles would result in desync (documented in plan.md Limitations section and quickstart.md Prerequisites)

## Requirements *(mandatory)*

### Functional Requirements

**Core Game Mechanics**

- **FR-001**: System MUST support a 15-level money ladder with configurable prize values for each level (default values: $100, $200, $300, $500, $1K, $2K, $4K, $8K, $16K, $32K, $64K, $125K, $250K, $500K, $1M)
- **FR-002**: System MUST support configurable safe haven positions (default: levels 5 and 10) where contestants are guaranteed that minimum amount if they answer incorrectly on subsequent questions
- **FR-003**: System MUST load question packs containing ordered questions with: question text, four answer choices (A-D), correct answer key, and level assignment (1-15)
- **FR-004**: System MUST validate imported question packs for: exactly 4 choices per question, unique choice keys (A-D), correct answer key exists in choices, and contiguous level assignments (1-15 with no gaps or duplicates); validation errors MUST display specific issues and allow import with host acknowledgment of warnings
- **FR-005**: Host MUST be able to start a question, which displays the question text and four answer choices on both host and contestant displays
- **FR-006**: Host MUST be able to select and lock in a contestant's final answer choice (A, B, C, or D)
- **FR-007**: Host MUST be able to trigger reveal sequence after final answer is locked, showing the correct answer highlighted and indicating win/lose outcome
- **FR-008**: System MUST advance to next level and update ladder display when contestant answers correctly
- **FR-009**: System MUST end game and calculate final winnings based on last safe haven reached when contestant answers incorrectly
- **FR-010**: System MUST display final winnings summary showing: total amount won, questions cleared, lifelines used, and highest safe haven reached

**Dual-Display Architecture**

- **FR-011**: System MUST provide two separate UI routes: `/host` for host controls and `/seat` for contestant/audience display
- **FR-012**: Host UI MUST be able to open contestant display (`/seat`) as a popup window from the host interface
- **FR-013**: System MUST synchronize all game state changes from host to contestant display in real-time using BroadcastChannel API (with postMessage fallback)
- **FR-014**: Contestant display MUST request full state synchronization when opened or reloaded, and resume displaying the current game state correctly
- **FR-015**: Synchronization MUST occur within 100ms for user-triggered actions (answer lock, reveal, lifeline activation) measured from host action to seat DOM update; validate using performance.now() timestamps with 5% tolerance for network variability
- **FR-016**: Both displays MUST show identical content for: current question text, answer choices, ladder position, cleared levels, and lifeline status

**Host Controls**

- **FR-017**: Host MUST have exclusive visibility of the correct answer key for all questions before reveal
- **FR-018**: Host MUST be able to configure game setup including: contestant name, question pack selection, starting level (default 1), safe haven positions, timer settings, and enabled lifelines
- **FR-019**: Host MUST be able to trigger "Walk Away" at any point before final answer is locked, ending the game with contestant keeping winnings from the last successfully cleared level (the highest level they answered correctly)
- **FR-020**: Host MUST have admin controls to: override current level, mark lifelines as used/unused, reset game state, and skip/replace questions
- **FR-021**: Host UI MUST display internal notes and explanations from question pack (if present) that are not visible on contestant display

**Contestant Display**

- **FR-022**: Contestant display MUST show read-only game information without accepting any user input/clicks
- **FR-023**: Contestant display MUST show money ladder with: all 15 levels, current level highlighted, cleared levels marked, safe haven positions indicated
- **FR-024**: Contestant display MUST show question text and four answer choices with visual states for: neutral, removed (50:50), selected, final answer locked, and revealed correct/incorrect
- **FR-025**: Contestant display MUST show lifeline status (Available, In Use, Used) for all enabled lifelines
- **FR-026**: Contestant display MUST show optional contestant name and current level value prominently

**Lifelines**

- **FR-027**: System MUST support 50:50 lifeline which randomly removes exactly two incorrect answers from the three available incorrect choices, leaving correct answer and one incorrect answer visible
- **FR-028**: System MUST support Ask the Audience lifeline which displays host-entered percentage values (summing to 100) for each answer choice as bar chart or percentage display
- **FR-029**: System MUST support Phone a Friend lifeline which displays optional countdown timer and host-entered friend suggestion text
- **FR-030**: Each lifeline MUST only be usable once per game, and MUST display "Used" status on both displays after activation
- **FR-031**: All lifelines MUST be disabled/unavailable once final answer has been locked or revealed
- **FR-032**: When 50:50 is used before Ask the Audience, the audience percentages MUST only display for remaining answer choices (or show removed choices as 0%)

**Timers**

- **FR-033**: System MUST support optional per-question countdown timer with configurable duration (default: disabled)
- **FR-034**: Question timer MUST display remaining time in seconds on both host and contestant displays, updating every second
- **FR-035**: When question timer reaches zero, system MUST display "Time's Up" indicator but NOT automatically force an answer or end the game
- **FR-036**: Phone a Friend lifeline MUST support optional countdown timer (e.g., 30 seconds) that displays remaining time and shows "Time's Up" when expired
- **FR-037**: Host MUST be able to start, pause, and reset any active timer

**Data & State Management**

- **FR-038**: System MUST persist complete game state including: current level, cleared level, active question, selected/locked answer, lifeline status (available/used/in-use), timer values, and contestant name
- **FR-039**: Game state MUST include phase tracking: SETUP, QUESTION, FINAL_LOCKED, REVEAL, BETWEEN, ENDED
- **FR-040**: System MUST support importing multiple question packs and allow host to select which pack to use for each game
- **FR-041**: Question packs MAY include optional fields: category, difficulty tags, media references as URLs (image/audio/video via http/https or file:// paths), and host-only explanations
- **FR-042**: System MUST validate that Ask the Audience percentages entered by host sum to exactly 100 before allowing display

**User Experience**

- **FR-043**: System MUST warn user before allowing navigation away or browser refresh during an active game (phase not SETUP or ENDED)
- **FR-044**: System MUST provide visual feedback for disabled/unavailable actions (grayed buttons, tooltips) for: used lifelines, locked actions, and phase-inappropriate actions
- **FR-045**: Contestant display MUST be optimized for 1080p/4K second-screen viewing with clear, show-style visual presentation
- **FR-046**: Host UI MUST display a visual indicator showing contestant display connection status (connected/disconnected) without modal dialogs or blocking popups

### Key Entities

- **GameState**: Represents complete current state of game including contestant info, ladder configuration, current question, lifeline status, timer values, and phase; synchronized from host to contestant display via BroadcastChannel
- **Question**: Represents a single trivia question with: unique ID, level (1-15), question text, four answer choices (A-D with text), correct answer key, optional category/difficulty/media URLs (external references), optional host-only explanations
- **QuestionPack**: Collection of ordered questions (typically 15) with metadata (name, description, creator); can be imported via JSON and validated on load
- **MoneyLadder**: Configuration of 15 prize levels with values and designated safe haven positions; determines current winnings and guaranteed amounts
- **Lifeline**: Represents state of each lifeline type (50:50, Ask Audience, Phone Friend) with: availability status, usage status, active state data (removed choices, audience percentages, friend suggestion, timer)
- **GamePhase**: Enumeration of game flow states (SETUP, QUESTION, FINAL_LOCKED, REVEAL, BETWEEN, ENDED) that control UI state and available actions
- **SyncEvent**: Messages passed between host and contestant displays via BroadcastChannel including: STATE_SYNC, QUESTION_STARTED, CHOICE_SELECTED, FINAL_LOCKED, REVEAL_SHOWN, LIFELINE_USED, TIMER_TICK, GAME_ENDED

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Host can import a 15-question pack and complete a full game from level 1 to level 15 with correct answers in under 5 minutes of real-time (excluding deliberation time)
- **SC-002**: Contestant display synchronizes with host actions (start question, lock answer, reveal) within 100 milliseconds, providing real-time visual feedback
- **SC-003**: System handles contestant display reload/reconnect and fully restores current game state within 1 second without requiring host intervention
- **SC-004**: All three lifelines (50:50, Ask the Audience, Phone a Friend) can be successfully activated and displayed on contestant screen, with host confirming visible and accurate information each time
- **SC-005**: When testing with incorrect answers at various levels, system correctly applies safe haven rules and displays accurate final winnings 100% of the time
- **SC-006**: Host can configure and import a custom question pack with modified ladder values and safe haven positions, and verify custom values are used in winnings calculations
- **SC-007**: Question pack validation catches and reports all critical errors (missing correct answer, invalid choice keys, malformed JSON) in 100% of intentionally malformed test files without crashing the application
- **SC-008**: Walk Away functionality correctly calculates and displays final winnings based on last cleared level for 100% of test cases across all 15 levels
- **SC-009**: System prevents invalid operations (using lifelines after final answer, activating used lifelines, revealing before locking) 100% of the time with clear user feedback
- **SC-010**: Contestant display remains readable and visually clear on 1080p and 4K screens with all UI elements (question, choices, ladder, lifelines) visible without scrolling or truncation

## Assumptions

- Game runs on same machine/browser profile with both windows using shared BroadcastChannel context (no cross-device/network play in MVP)
- Question packs are created/edited externally and imported as valid JSON files (no in-app question editor)
- Host has reliable manual control and makes all game flow decisions (no automated time-outs or forced answers)
- Standard web browser with modern API support (BroadcastChannel, ES6+, popup windows allowed)
- Single contestant per game session (no multi-player or tournament bracket support)
- Host acts as both game master and adjudicator (no contestant input controls)
- Audio/visual assets use original inspired-by styling (no licensed media)
- Default ladder uses classic game show values ($100, $200, $300, $500, $1K, $2K, $4K, $8K, $16K, $32K, $64K, $125K, $250K, $500K, $1M); customizable for other currencies
- 50:50 removes two incorrect answers randomly from the three available incorrect choices
- Phone a Friend suggestions are entered manually by host (no actual phone integration or external communication)
- Ask the Audience percentages entered manually by host (no live audience polling system)
- Game state is session-based in browser memory (no backend persistence or save/resume across browser restarts)

## Dependencies

- Modern web browser with support for: BroadcastChannel API, window.postMessage (fallback), popup windows, ES6+ JavaScript
- Angular 21+ framework with Material Design components (specified in original requirements)
- No external backend services or APIs required for MVP functionality
- No third-party authentication or user management systems required
- Question pack JSON files created and validated externally before import

## Out of Scope (MVP)

- Multi-device network play using WebSocket or server backend
- Real-time audience polling integration for Ask the Audience percentages
- Actual phone/video call integration for Phone a Friend lifeline
- Automated audience/friend response generation based on difficulty or AI
- Licensed audio clips, music, graphics, or animations
- In-app question pack editor or question authoring tools
- Persistent storage or database for game history, statistics, or saved games
- User accounts, authentication, or multi-user session management
- Tournament brackets or multi-contestant competition format
- Accessibility features beyond standard browser support (screen readers, keyboard-only navigation)
- Mobile/tablet responsive layouts (optimized for desktop/large screen only)
- Localization or internationalization for multiple languages
- Analytics, telemetry, or usage tracking
- Export/sharing of game results or replay functionality
