<!--
SYNC IMPACT REPORT
==================
Version Change: Initial → 1.0.0
Rationale: First constitution for Who Wants to Be a Millionaire game project

Modified/Added Principles:
- NEW: I. Component-Based Architecture
- NEW: II. Synchronized State Management
- NEW: III. No Testing Required
- NEW: IV. Angular Best Practices
- NEW: V. Show-Like UX Fidelity

Added Sections:
- Technology Stack Requirements
- Development Workflow

Templates Status:
- ✅ plan-template.md: Constitution Check section aligns with principles
- ✅ spec-template.md: User stories and requirements structure supports component-based development
- ✅ tasks-template.md: Tests marked as OPTIONAL; structure supports independent component work

Follow-up Actions: None
-->

# Who Wants to Be a Millionaire Game Constitution

## Core Principles

### I. Component-Based Architecture

**MUST** organize application into self-contained, reusable Angular components with clear responsibilities:

- Host UI and Seat UI MUST be separate, independently functioning views
- Each game feature (question display, lifelines, timer, ladder) MUST be isolated as dedicated components
- Components MUST communicate through well-defined interfaces (Inputs/Outputs)
- Shared state MUST NOT be accessed directly; use services for cross-component data flow

**Rationale**: Component isolation enables parallel development, simplifies debugging, and supports the dual-screen synchronization requirement without coupling Host and Seat implementations.

### II. Synchronized State Management

**MUST** maintain single source of truth for game state with reliable sync between Host and Seat UIs:

- Host window owns and mutates all game state
- Seat window is read-only consumer of state
- State synchronization MUST use BroadcastChannel as primary mechanism with postMessage fallback
- All state changes MUST emit sync events with full or delta state payloads
- Seat MUST handle reconnection gracefully via STATE_SYNC request on load/reload
- State model MUST include all fields required to reconstruct full UI on both screens

**Rationale**: Dual-screen gameplay depends on reliable, low-latency synchronization. Single source of truth prevents divergence and race conditions. Reconnection support ensures production resilience.

### III. No Testing Required

Tests are **EXPLICITLY EXCLUDED** from this project:

- No unit tests shall be written
- No integration tests shall be written
- No end-to-end tests shall be written
- Testing infrastructure (Karma, Jasmine) MAY remain in project scaffold but SHALL NOT be actively used
- Validation occurs through manual testing and user acceptance

**Rationale**: Per project requirements, testing is out of scope. Focus is on rapid feature delivery with manual validation.

### IV. Angular Best Practices (MANDATORY)

**MUST** follow Angular 20+ conventions and ecosystem standards:

- Use standalone components (no NgModules)
- Leverage Angular Material for UI components where applicable
- Apply Reactive Forms for any user input (host controls)
- Use RxJS observables for async operations and event streams
- Follow Angular Style Guide for file structure, naming, and code organization
- Use Angular Router for `/host` and `/seat` route definitions
- TypeScript strict mode MUST be enabled
- Components MUST use OnPush change detection strategy where feasible

**Rationale**: Consistency with Angular best practices ensures maintainability, leverages framework optimizations, and produces idiomatic code familiar to Angular developers.

### V. Show-Like UX Fidelity

**MUST** deliver production-quality, television-show-inspired user experience:

- Seat UI MUST be designed for 1080p/4K second-screen display with high visual polish
- Layout and styling MUST convey the drama and pacing of the game show format
- Responsive design MUST adapt to various screen sizes while preserving show aesthetic
- Animations and transitions MUST feel intentional and polished (not rushed or janky)
- Host UI MUST prioritize usability and clarity for operator control
- UI states (loading, locked answer, reveal, game end) MUST have distinct, unambiguous visual treatments

**Rationale**: The game's entertainment value depends on presentation quality. Seat display is audience-facing and must match expectations for a game show experience.

## Technology Stack Requirements

**Language/Framework**: Angular 20+ with TypeScript 5.9+  
**UI Library**: Angular Material (where applicable); custom components allowed  
**State Management**: Service-based with RxJS; BroadcastChannel API for cross-window sync  
**Routing**: Angular Router (two routes: `/host`, `/seat`)  
**Build Tool**: Angular CLI 20+  
**Styling**: SCSS with component-scoped styles; shared theme variables allowed  
**Browser Support**: Modern evergreen browsers (Chrome, Edge, Firefox, Safari latest)  
**No Backend**: All functionality client-side; no server or database required for MVP

**Constraints**:

- Item size limit: N/A (client-side only; question packs loaded via import/file)
- Popup window must survive reload with graceful resync
- No external runtime dependencies beyond Angular framework

## Development Workflow

**Feature Implementation Process**:

1. Review spec.md and identify the feature or component to implement
2. Plan component structure and state requirements
3. Implement components following Angular best practices
4. Manually test Host UI and Seat UI sync behavior
5. Validate edge cases (reload, navigation, lifeline states, etc.)
6. Update documentation if user-facing behavior changes

**Manual Testing Checklist** (per feature/change):

- Host can perform intended action
- Seat display reflects state change accurately
- Reload `/seat` → state re-syncs correctly
- Browser console shows no errors
- UI remains responsive and visually polished

**Code Quality Standards**:

- TypeScript strict mode errors MUST be zero
- ESLint/Prettier rules MUST pass
- Component responsibilities clearly separated
- Observable subscriptions properly managed (no memory leaks)

**No CI/CD Testing Gates**: Since tests are excluded, deployment readiness is validated through manual acceptance by stakeholder.

## Governance

This Constitution supersedes all other development practices and preferences. Any deviation MUST be documented and justified as a complexity exception with stakeholder approval.

**Amendment Process**:

- Amendments require update to this file with version bump
- Version increments follow semantic versioning: MAJOR (breaking principle changes), MINOR (new principles), PATCH (clarifications)
- All amendments MUST include a Sync Impact Report documenting template and guidance updates
- Constitution changes MUST be reviewed before merging feature branches that depend on new principles

**Compliance**:

- All feature development MUST adhere to principles I–V
- Technology stack MUST NOT introduce dependencies incompatible with Angular 20+ or BroadcastChannel API
- Complexity MUST be justified if component isolation or state management principles are violated

**Version**: 1.0.0 | **Ratified**: 2025-12-14 | **Last Amended**: 2025-12-14
