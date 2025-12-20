import { GamePhase } from './game-phase.model';
import { Question, QuestionPack } from './question.model';
import { MoneyLadder, createDefaultLadder } from './money-ladder.model';
import { LifelineState, createDefaultLifelines } from './lifeline.model';
import { TimerState } from './timer.model';
import { ChoiceKey } from './choice-key.model';

/**
 * Root game state object - single source of truth
 * Owned by host, synchronized to seat via BroadcastChannel
 */
export interface GameState {
  readonly gameId: string;
  phase: GamePhase;
  contestantName: string | null;
  currentLevel: number;
  clearedLevel: number;
  currentQuestion: Question | null;
  selectedChoice: ChoiceKey | null;
  finalAnswer: ChoiceKey | null;
  correctAnswer: ChoiceKey | null;
  ladder: MoneyLadder;
  lifelines: LifelineState;
  questionPack: QuestionPack | null;
  questionTimer: TimerState | null;
  questionTimerDuration: number | null;
  finalWinnings: number;
  walkAway: boolean;
  questionVisible: boolean;
  hideConnectionStatus: boolean;
}

/**
 * Create default game state
 */
export function createDefaultGameState(): GameState {
  return {
    gameId: crypto.randomUUID(),
    phase: GamePhase.SETUP,
    contestantName: null,
    currentLevel: 1,
    clearedLevel: 0,
    currentQuestion: null,
    selectedChoice: null,
    finalAnswer: null,
    correctAnswer: null,
    ladder: createDefaultLadder(),
    lifelines: createDefaultLifelines(),
    questionPack: null,
    questionTimer: null,
    questionTimerDuration: null,
    finalWinnings: 0,
    walkAway: false,
    questionVisible: false,
    hideConnectionStatus: true
  };
}

/**
 * Calculate winnings based on game state
 * Returns appropriate winnings based on walk away or incorrect answer
 */
export function calculateWinnings(gameState: GameState): number {
  if (gameState.walkAway) {
    // Walk away: get last cleared level value
    return gameState.clearedLevel > 0
      ? gameState.ladder.levels[gameState.clearedLevel - 1].value
      : 0;
  }

  // Incorrect answer: get last safe haven value
  const safeHavens = gameState.ladder.safeHavens.sort((a, b) => b - a);
  const lastSafeHaven = safeHavens.find(sh => sh <= gameState.clearedLevel) || 0;
  return lastSafeHaven > 0
    ? gameState.ladder.levels[lastSafeHaven - 1].value
    : 0;
}
