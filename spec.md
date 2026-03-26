## 1) Product overview

Build an **Angular 21+ single-page app** that runs a **Who Wants to Be Rich–style game** in a browser with **two synchronized UIs**:

* **Host UI**: controls game flow, loads question packs, triggers reveals/locks, manages timer, lifelines, and adjudication.
* **Contestant/Audience UI** (“Hot Seat”): opened as a **popup window** for a second screen; show-like display of the current question ladder, question text, answer choices, and lifeline status (read-only).

Two windows sync in real time on the same machine/browser profile.

---

## 2) App structure

### Routes

* `/host` — host console
* `/seat` — contestant/audience display (popup)

### Sync mechanism

* Primary: **BroadcastChannel**
* Fallback: `window.postMessage`

**Requirement:** `/seat` reload requests a full `STATE_SYNC` and resumes correctly.

---

## 3) Game content (question pack spec)

### Question pack format (spec-defined)

A pack contains an ordered list of questions, each mapped to a **money level**:

Each question:

* `id`
* `level` (1..15)
* `questionText`
* `choices`: `{ key: 'A'|'B'|'C'|'D', text: string }[4]`
* `correctKey`: 'A'|'B'|'C'|'D' (host-only until reveal)
* optional `category`, `difficultyTag`, `media` (image/audio/video)
* optional `explanations` (host-only notes)

### Validation requirements

* Exactly 4 choices per question, keys A–D unique
* `correctKey` must exist in the choices
* Levels must be contiguous if using a single “classic ladder” run (1–15) OR allow custom ladders (configurable)
* Support multiple packs; host chooses which pack/run to use

---

## 4) Money ladder model

Default classic ladder (configurable):

* 15 total levels
* **Safe havens** (defaults): Level 5 and Level 10
* Level values stored in config: `moneyLevels: number[]` aligned to 1..15

Board display:

* Ladder list with current level highlighted
* Used/cleared levels marked

---

## 5) Core game flow (MVP)

### A. Setup

Host configures:

* Contestant name (optional)
* Question pack + starting level (default 1)
* Safe haven levels (default 5, 10)
* Timer settings:

  * per-question time limit (default OFF; configurable)
* Lifelines enabled (default: 50:50, Phone a Friend, Ask the Audience)

### B. Ask question

1. Host clicks **“Start Question”**
2. Seat display shows:

   * question text
   * four answers A–D (unselected)
   * ladder with current level highlighted
3. Host optionally starts timer.

### C. Final answer

1. Host selects a choice (A/B/C/D) when contestant locks in.
2. Seat display shows:

   * “Final Answer” state (highlight chosen)
3. Host triggers **“Reveal”** sequence:

   * highlight correct answer
   * indicate win/lose
4. If correct:

   * advance to next level
   * update ladder and “current winnings”
5. If incorrect:

   * drop to last safe haven (or 0) per rules
   * end game

### D. Walk away

Host can trigger **“Walk Away”** at any time before locking final answer:

* Contestant keeps current guaranteed amount (the last cleared level)
* Seat display shows “Walk Away” outcome
* Game ends

### E. Game end

Seat display shows:

* final winnings
* summary: questions cleared, lifelines used, safe haven reached

---

## 6) Lifelines (MVP behavior)

### 6.1 50:50

Host activates 50:50:

* System removes **two incorrect options** (deterministic or random among incorrect; configurable)
* Seat display greys/removes those two choices
* Remaining: correct + one incorrect
  Constraints:
* Can only be used once
* Cannot be activated after final answer is locked

### 6.2 Ask the Audience

Host activates:

* Host sets or generates audience percentages for A–D

  * MVP: host manually enters percentages (must sum to 100)
  * Optional: auto-generate weighted toward correct by difficulty
* Seat display shows a bar chart / percentages
  Constraints:
* Can only be used once
* Works even after 50:50 (then only show remaining choices or show all with removed as 0; configurable)

### 6.3 Phone a Friend

Host activates:

* Starts a phone timer (optional)
* Host can enter/display a “friend’s suggestion” (e.g., “I think it’s C”)
  Seat display shows:
* “Phone a Friend” in progress
* suggestion text when host reveals it
  Constraints:
* Can only be used once

**Lifeline state** must persist and display as Used/Available on both host and seat UIs.

---

## 7) Host UI specification

### Sections

1. **Game Setup**

   * contestant name
   * choose question pack/run
   * configure ladder values + safe havens
   * timer toggles
   * enable/disable lifelines
2. **Question Control**

   * current question preview (host sees correct answer)
   * buttons: Start Question, Lock Final Answer, Reveal Correct, Next Question
   * walk away control
3. **Lifelines Control**

   * 50:50 activate
   * Ask the Audience: input percentages + reveal/hide
   * Phone a Friend: start/stop timer + suggestion input + reveal/hide
4. **State/Admin**

   * override current level
   * mark lifeline used/unused (admin override)
   * skip question / replace question (optional)
   * reset game

### Host-only visibility

* correct answer key
* internal notes/explanations
* any “rigging” controls (if you want manual audience/friend inputs)

---

## 8) Seat (Contestant/Audience) UI specification

### Main layout (show-like)

* Top: Contestant name (optional) + current level value
* Center: Question text
* Bottom: Answer choices A–D with selectable/highlight states:

  * default: neutral
  * removed (50:50): dim/hidden
  * selected: highlighted
  * final answer locked: “Final Answer” styling
  * reveal: correct highlighted; incorrect marked
* Side panel: Money ladder (15 levels) with:

  * current position highlight
  * cleared levels marked
  * safe havens indicated
* Lifeline icons/status:

  * Available / In Use / Used

### Lifeline displays

* Ask the Audience: show percentages graph overlay/panel
* Phone a Friend: show countdown + suggestion when revealed

Seat UI is **read-only** (no clicks required). Host drives all actions.

---

## 9) State model & events

### Single source of truth

Host window owns `GameState`, seat subscribes.

### Minimal `GameState`

* `contestant: { name }`
* `ladder: { levels: number[], safeHavens: number[], currentLevel: number, clearedLevel: number }`
* `question: { id, level, text, choices, removedKeys: string[], selectedKey?: string, finalLocked: boolean, correctKey?: string, revealed: boolean }`
* `lifelines: {
    fiftyFifty: { available, used },
    audience: { available, used, shown, percentages?: {A,B,C,D} },
    phone: { available, used, shown, suggestion?: string, secondsRemaining?: number, running?: boolean }
  }`
* `timer: { enabled, secondsRemaining?: number, running?: boolean }`
* `phase`: `SETUP | QUESTION | FINAL_LOCKED | REVEAL | BETWEEN | ENDED`
* `result?: { outcome: 'CORRECT'|'INCORRECT'|'WALK_AWAY', winnings: number }`

### Events (host → seat)

* `STATE_SYNC`
* `PHASE_CHANGED`
* `QUESTION_STARTED`
* `CHOICE_SELECTED`
* `FINAL_LOCKED`
* `REVEAL_SHOWN`
* `LIFELINE_USED`
* `AUDIENCE_SHOWN`
* `PHONE_SHOWN`
* `TIMER_TICK`
* `GAME_ENDED`

Seat → host (optional)

* `SEAT_READY`
* `RESYNC_REQUEST`

---

## 10) Timers (optional in MVP but spec-ready)

Two timers:

* **Question timer** (per question)
* **Phone timer** (lifeline)

Requirements:

* host can start/pause/reset
* seat displays countdown when running
* timer reaching 0 does **not** auto-adjudicate; it triggers a “TIME UP” indicator and host decides outcome

---

## 11) Non-functional requirements

* No backend required for MVP
* Popup re-sync on reload
* Responsive for 1080p/4K second-screen display
* Guard against accidental refresh/close during active game
* Import validation warnings must never crash app

---

## 12) Acceptance criteria (MVP)

1. Host can load a question pack and start a new game at Level 1.
2. Host can open `/seat` popup and it stays synchronized.
3. Seat displays the ladder, question, and 4 choices in a show-like layout.
4. Host can select an answer, lock “Final Answer”, and reveal correct/incorrect; seat updates accordingly.
5. Correct answers advance the level; incorrect answers end the game and apply safe haven drop.
6. Host can trigger Walk Away and end the game with current cleared winnings.
7. Lifelines:

   * 50:50 removes two incorrect choices
   * Ask the Audience displays host-entered percentages summing to 100
   * Phone a Friend displays a timer and a host-entered suggestion
8. Lifelines can only be used once and display used state on seat UI.

---

## 13) Out of scope (for MVP)

* Multi-device play over a network (server/WebSocket)
* Automatic “smart” audience/friend generation by difficulty (can add later)
* Licensed audio/visual assets (use original, inspired-by styling)
* Full cinematic animation/sound package

If you want, I can also define a **JSON schema** for the question pack and a **validator** spec similar to the Family Feud one, so you can import packs safely and reuse the same host/seat architecture across all three games.
