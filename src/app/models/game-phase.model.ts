/**
 * Game flow phase enumeration
 * Strictly enforces state transitions through game lifecycle
 */
export enum GamePhase {
  SETUP = 'SETUP',
  QUESTION = 'QUESTION',
  FINAL_LOCKED = 'FINAL_LOCKED',
  REVEAL = 'REVEAL',
  BETWEEN = 'BETWEEN',
  ENDED = 'ENDED'
}
