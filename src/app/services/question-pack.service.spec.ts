import { TestBed } from '@angular/core/testing';
import { QuestionPackService } from './question-pack.service';

function createQuestion(level: number) {
  return {
    id: `q${level}`,
    level,
    text: `Question text for level ${level}?`,
    choices: [
      { key: 'A', text: 'Answer A' },
      { key: 'B', text: 'Answer B' },
      { key: 'C', text: 'Answer C' },
      { key: 'D', text: 'Answer D' }
    ],
    correctAnswer: 'A' as const,
    difficulty: level <= 5 ? 'easy' : (level <= 10 ? 'medium' : 'hard')
  };
}

describe('QuestionPackService', () => {
  let service: QuestionPackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuestionPackService);
  });

  it('loads predefined packs from manifest and avoids duplicate loading', async () => {
    const pack = {
      name: 'Predefined Pack',
      description: 'Pack loaded from assets',
      creator: 'Test',
      questions: Array.from({ length: 15 }, (_, i) => createQuestion(i + 1))
    };

    const fetchSpy = spyOn(window, 'fetch').and.callFake((input: RequestInfo | URL) => {
      const url = String(input);

      if (url.endsWith('/predefined-packs/index.json')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 'pack-1', name: 'Predefined Pack', file: 'pack-1.json' }]
        } as Response);
      }

      if (url.endsWith('/predefined-packs/pack-1.json')) {
        return Promise.resolve({
          ok: true,
          json: async () => pack
        } as Response);
      }

      return Promise.resolve({ ok: false, status: 404 } as Response);
    });

    await service.loadPredefinedPacks();
    const firstLoadPacks = await new Promise<any[]>((resolve) => {
      service.getAvailablePacks().subscribe(resolve);
    });
    expect(firstLoadPacks.length).toBe(1);

    await service.loadPredefinedPacks();
    const secondLoadPacks = await new Promise<any[]>((resolve) => {
      service.getAvailablePacks().subscribe(resolve);
    });
    expect(secondLoadPacks.length).toBe(1);
    expect(fetchSpy.calls.count()).toBe(2);
  });
});
