/**
 * Performance tests for schema validation
 * Ensures validation completes within 200ms (SC-002)
 */
import { describe, it, expect } from 'vitest';
import { validatePromptCreateRequest } from '../../lib/schemas/validator';

describe('Validation Performance', () => {
  const validPromptData = {
    lyrics: `[Verse 1]
In the midnight rain, I'm calling your name
The memories wash away, never the same

[Chorus]
We'll rise again, stronger than before
Through the storm and pain, we'll soar even more`,
    style: 'Pop, emotional, uplifting, 120-140 BPM',
    vocal: {
      gender: 'female',
      timbre: 'clear, warm, powerful',
      style: 'ballad',
    },
    instrumental: {
      instruments: ['piano', 'strings', 'light drums'],
      bpm: 130,
    },
  };

  it('should validate a complete prompt within 200ms', () => {
    const start = performance.now();
    const result = validatePromptCreateRequest(validPromptData);
    const duration = performance.now() - start;

    expect(result.valid).toBe(true);
    expect(duration).toBeLessThan(200);
  });

  it('should validate minimal prompt within 200ms', () => {
    const start = performance.now();
    const result = validatePromptCreateRequest({
      lyrics: 'Simple lyrics',
    });
    const duration = performance.now() - start;

    expect(result.valid).toBe(true);
    expect(duration).toBeLessThan(200);
  });

  it('should validate large lyrics within 200ms', () => {
    const largeLyrics = 'A'.repeat(3500);

    const start = performance.now();
    const result = validatePromptCreateRequest({
      lyrics: largeLyrics,
      style: 'Pop',
    });
    const duration = performance.now() - start;

    expect(result.valid).toBe(true);
    expect(duration).toBeLessThan(200);
  });

  it('should handle invalid validation within 200ms', () => {
    const start = performance.now();
    const result = validatePromptCreateRequest({});
    const duration = performance.now() - start;

    expect(result.valid).toBe(false);
    expect(duration).toBeLessThan(200);
  });

  it('should validate 100 prompts in batch within 5 seconds', () => {
    const prompts = Array.from({ length: 100 }, (_, i) => ({
      ...validPromptData,
      lyrics: `[Verse ${i}]\nTest lyrics ${i}`,
    }));

    const start = performance.now();
    for (const prompt of prompts) {
      validatePromptCreateRequest(prompt);
    }
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(5000);
  });
});
