/**
 * A single level in the money ladder
 */
export interface LadderLevel {
  levelNumber: number;
  value: number;
}

/**
 * Money ladder configuration (15 levels + safe havens)
 */
export interface MoneyLadder {
  levels: LadderLevel[];
  safeHavens: number[];
}

/**
 * Create default money ladder (classic UK/US Millionaire)
 */
export function createDefaultLadder(): MoneyLadder {
  return {
    levels: [
      { levelNumber: 1, value: 100 },
      { levelNumber: 2, value: 200 },
      { levelNumber: 3, value: 300 },
      { levelNumber: 4, value: 500 },
      { levelNumber: 5, value: 1000 },
      { levelNumber: 6, value: 2000 },
      { levelNumber: 7, value: 4000 },
      { levelNumber: 8, value: 8000 },
      { levelNumber: 9, value: 16000 },
      { levelNumber: 10, value: 32000 },
      { levelNumber: 11, value: 64000 },
      { levelNumber: 12, value: 125000 },
      { levelNumber: 13, value: 250000 },
      { levelNumber: 14, value: 500000 },
      { levelNumber: 15, value: 1000000 }
    ],
    safeHavens: [5, 10]
  };
}
