import { ChoiceKey, Difficulty } from './choice-key.model';

/**
 * An answer choice for a question
 */
export interface Choice {
  key: ChoiceKey;
  text: string;
}

/**
 * A single trivia question
 */
export interface Question {
  readonly id: string;
  level: number;
  text: string;
  choices: Choice[];
  correctAnswer: ChoiceKey;
  category?: string;
  difficulty?: Difficulty;
  explanation?: string;
  mediaUrl?: string;
}

/**
 * A collection of questions (importable from JSON)
 */
export interface QuestionPack {
  readonly id: string;
  name: string;
  description?: string;
  creator?: string;
  questions: Question[];
}
