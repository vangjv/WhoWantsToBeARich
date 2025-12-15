/**
 * Valid answer choice keys (A, B, C, or D)
 */
export type ChoiceKey = 'A' | 'B' | 'C' | 'D';

/**
 * Question difficulty levels (optional metadata)
 */
export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * Lifeline type discriminator
 */
export type LifelineType = 'fiftyFifty' | 'askAudience' | 'phoneFriend';
