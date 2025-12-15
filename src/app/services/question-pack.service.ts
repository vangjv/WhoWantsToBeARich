import { Injectable } from '@angular/core';
import { z } from 'zod';
import { QuestionPack, Question } from '../models/question.model';

/**
 * Zod schema for Choice validation
 */
const ChoiceSchema = z.object({
  key: z.enum(['A', 'B', 'C', 'D']),
  text: z.string().min(1).max(200)
});

/**
 * Zod schema for Question validation
 */
const QuestionSchema = z.object({
  id: z.string(),
  level: z.number().int().min(1).max(15),
  text: z.string().min(10).max(500),
  choices: z.array(ChoiceSchema).length(4),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']),
  category: z.string().max(50).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  explanation: z.string().max(1000).optional(),
  mediaUrl: z.string().url().optional()
}).refine(
  (q) => q.choices.some((c) => c.key === q.correctAnswer),
  { message: 'Correct answer must exist in choices' }
).refine(
  (q) => {
    const keys = q.choices.map(c => c.key);
    return new Set(keys).size === 4;
  },
  { message: 'All choice keys must be unique (A, B, C, D)' }
);

/**
 * Zod schema for QuestionPack validation
 */
const QuestionPackSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  creator: z.string().max(100).optional(),
  questions: z.array(QuestionSchema).min(1).max(15)
}).refine(
  (pack) => {
    const levels = pack.questions.map((q) => q.level).sort((a, b) => a - b);
    const expected = Array.from({ length: levels.length }, (_, i) => i + 1);
    return JSON.stringify(levels) === JSON.stringify(expected);
  },
  { message: 'Question levels must be contiguous from 1 to N (no gaps or duplicates)' }
);

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  pack?: QuestionPack;
}

/**
 * Service for importing and validating question packs
 */
@Injectable({
  providedIn: 'root'
})
export class QuestionPackService {
  private packs: Map<string, QuestionPack> = new Map();

  /**
   * Import question pack from JSON with validation
   */
  public async importPack(file: File): Promise<ValidationResult> {
    try {
      const text = await file.text();
      const json = JSON.parse(text);

      return this.validatePack(json);
    } catch (error) {
      return {
        valid: false,
        errors: [`Failed to parse JSON: ${(error as Error).message}`]
      };
    }
  }

  /**
   * Validate question pack structure
   */
  public validatePack(data: any): ValidationResult {
    try {
      const validated = QuestionPackSchema.parse(data);

      // Create QuestionPack with generated ID
      const pack: QuestionPack = {
        id: crypto.randomUUID(),
        name: validated.name,
        description: validated.description,
        creator: validated.creator,
        questions: validated.questions as Question[]
      };

      return {
        valid: true,
        errors: [],
        pack
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`);
        return {
          valid: false,
          errors
        };
      }

      return {
        valid: false,
        errors: [`Validation error: ${(error as Error).message}`]
      };
    }
  }

  /**
   * Save question pack to memory
   */
  public savePack(pack: QuestionPack): void {
    this.packs.set(pack.id, pack);
    console.log(`[QuestionPackService] Saved pack: ${pack.name} (${pack.id})`);
  }

  /**
   * Load question pack by ID
   */
  public loadPack(id: string): QuestionPack | undefined {
    return this.packs.get(id);
  }

  /**
   * List all imported question packs
   */
  public listPacks(): QuestionPack[] {
    return Array.from(this.packs.values());
  }

  /**
   * Delete question pack
   */
  public deletePack(id: string): boolean {
    return this.packs.delete(id);
  }

  /**
   * Clear all packs
   */
  public clearAll(): void {
    this.packs.clear();
    console.log('[QuestionPackService] All packs cleared');
  }
}
