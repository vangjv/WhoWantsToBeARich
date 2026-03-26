# Who Wants to Be Rich

A browser-based **"Who Wants to Be a Millionaire"-style game show application** built with Angular 21+. It runs across two synchronized browser windows — a **Host UI** for full game control and a **Seat UI** for the contestant/audience display.

---

## Features

- **Dual-display architecture** — Host and Seat windows stay in sync in real time via the [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel_API)
- **15-level money ladder** — Classic progression from $100 → $1,000,000 with configurable safe havens at levels 5 and 10
- **Three lifelines**:
  - **50:50** — Removes two random incorrect answers
  - **Ask the Audience** — Host enters percentages; bar chart displayed on Seat
  - **Phone a Friend** — Optional 30-second timer with host-entered suggestion text
- **Walk Away** — Contestant can quit at any time before locking a final answer and keep their last cleared level's winnings
- **Question Pack import** — Load custom question sets from JSON files validated against a built-in schema
- **Soundboard** — In-game audio controls for the host
- **Seat reconnection** — Contestant display auto-syncs full game state on reload or reconnect
- **Session persistence** — Game state is saved to `sessionStorage` so the host can survive a page refresh

---

## Architecture

```
/host  →  Host control console (one active instance)
/seat  →  Contestant display (popup opened by host)
```

The **Host UI** owns all game state mutations. The **Seat UI** is a read-only consumer that subscribes to events from the `SyncService` (BroadcastChannel `rich-game`). When the Seat window loads or reloads, it sends a `STATE_SYNC_REQUEST` message and the Host responds with a full `STATE_SYNC_RESPONSE` snapshot.

The correct answer is **never sent to the Seat** until the `REVEAL` phase.

### Game Phase Transitions

```
SETUP → QUESTION → FINAL_LOCKED → REVEAL → BETWEEN → ENDED → SETUP
```

### Key Services

| Service | Responsibility |
|---|---|
| `GameStateService` | Manages all state mutations; host-only |
| `SyncService` | BroadcastChannel messaging (bidirectional) |
| `QuestionPackService` | JSON import, Zod schema validation |
| `LadderConfigService` | Money ladder and safe-haven configuration |
| `SoundService` | In-game audio playback |

---

## Tech Stack

| Technology | Version |
|---|---|
| Angular | 21.x |
| Angular Material | 21.x |
| ngx-layout (`@ngbracket/ngx-layout`) | 21.x |
| RxJS | 7.8 |
| Zod (schema validation) | 4.x |
| TypeScript | 5.9 |
| Cloudflare Pages (deploy target) | — |

All components use **OnPush change detection** and the **standalone component** pattern. Signals-based reactivity is used throughout.

---

## Question Pack Format

Question packs are JSON files imported at runtime. Each pack contains 1–15 questions.

**Minimal example:**

```json
{
  "name": "Sample Pack",
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
      "correctAnswer": "A"
    }
  ]
}
```

**Optional question fields:** `category`, `difficulty` (`easy`/`medium`/`hard`), `explanation` (host-only), `mediaUrl` (http/https/file://).

See [`specs/001-rich-game-app/contracts/question-pack.schema.json`](specs/001-rich-game-app/contracts/question-pack.schema.json) for the full JSON Schema.

---

## Prerequisites

- **Node.js** v20+ (LTS)
- **npm** v10+
- **Angular CLI** v21+

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

Open your browser to `http://localhost:4200`. The app redirects to `/host` by default. Use the **"Open Contestant Display"** button in the Host UI to launch the Seat window.

> **Popup note:** Your browser must allow popups for `localhost` so the Seat window can be opened.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm start` | Start the dev server at `http://localhost:4200` |
| `npm run build` | Production build (output: `dist/`) |
| `npm run watch` | Development build in watch mode |
| `npm run deploy` | Build and deploy to Cloudflare Pages via Wrangler |

> **Offline builds:** Use `npm run build -- --configuration development` to skip Google Fonts inlining if you are building without internet access.

---

## Project Structure

```
src/app/
├── host/                   # Host control console components
│   ├── host-layout/        # Root host shell
│   ├── game-setup/         # Question pack import & game config
│   ├── question-control/   # Start/lock/reveal controls
│   ├── lifeline-control/   # 50:50 / Ask the Audience / Phone a Friend
│   ├── host-ladder/        # Money ladder (host view)
│   ├── soundboard/         # Audio controls
│   ├── admin-panel/        # Advanced admin controls
│   └── ...dialogs/         # Audience percentages, phone friend, validation
├── seat/                   # Contestant display components
│   ├── seat-layout/        # Root seat shell
│   ├── question-display/   # Question and answer choices
│   ├── seat-ladder/        # Money ladder (seat view)
│   └── lifeline-status/    # Lifeline availability indicators
├── shared/                 # Shared components (timer, answer choices, etc.)
├── models/                 # TypeScript interfaces & enums
├── services/               # GameStateService, SyncService, etc.
└── guards/                 # Route guards (UnsavedChangesGuard)
specs/
└── 001-rich-game-app/      # Feature spec, plan, contracts, and schema
```

---

## Deployment

The app is configured for **Cloudflare Pages** using [Wrangler](https://developers.cloudflare.com/workers/wrangler/). Angular deep-link routing is handled via the `single-page-application` not-found mode in `wrangler.toml`.

```bash
npm run deploy
```

---

## Browser Compatibility

The BroadcastChannel API is required for cross-window sync. This is supported in all modern browsers (Chrome, Edge, Firefox, Safari).

**Constraints:**
- Both windows must share the same origin (protocol + domain + port). Cross-device play is not supported.
- Only one Host tab should be open per browser profile to avoid state conflicts.
- Closing all windows ends the session permanently (no server-side persistence).

---

## Additional Resources

- [Angular CLI documentation](https://angular.dev/tools/cli)
- [Angular Material](https://material.angular.io/)
- [BroadcastChannel API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel_API)
- [Cloudflare Pages](https://pages.cloudflare.com/)

