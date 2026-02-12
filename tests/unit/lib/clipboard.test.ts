import { describe, it, expect, vi } from 'vitest';
import { formatPromptForCopy } from '@/lib/clipboard';

describe('formatPromptForCopy', () => {
  it('should format all fields when all are provided', () => {
    const prompt = {
      lyrics: '[Verse]\nTest lyrics',
      style: 'Pop style',
      vocal: JSON.stringify({ gender: 'female', timbre: 'sweet' }),
      instrumental: JSON.stringify({ instruments: ['piano', 'drums'] }),
    };

    const result = formatPromptForCopy(prompt);

    expect(result.field_count).toBe(4);
    expect(result.fields).toEqual(['lyrics', 'style', 'vocal', 'instrumental']);
    expect(result.text).toContain('lyrics:\n[Verse]\nTest lyrics');
    expect(result.text).toContain('style:\nPop style');
    expect(result.text).toContain('vocal:\n{"gender":"female","timbre":"sweet"}');
    expect(result.text).toContain('instrumental:\n{"instruments":["piano","drums"]}');
  });

  it('should only include non-empty fields', () => {
    const prompt = {
      lyrics: '[Verse]\nTest lyrics',
      style: null,
      vocal: null,
      instrumental: null,
    };

    const result = formatPromptForCopy(prompt);

    expect(result.field_count).toBe(1);
    expect(result.fields).toEqual(['lyrics']);
    expect(result.text).toBe('lyrics:\n[Verse]\nTest lyrics');
  });

  it('should return empty text when all fields are null', () => {
    const prompt = {
      lyrics: null,
      style: null,
      vocal: null,
      instrumental: null,
    };

    const result = formatPromptForCopy(prompt);

    expect(result.field_count).toBe(0);
    expect(result.fields).toEqual([]);
    expect(result.text).toBe('');
  });

  it('should maintain field order: lyrics, style, vocal, instrumental', () => {
    const prompt = {
      instrumental: JSON.stringify({ instruments: ['piano'] }),
      lyrics: 'Test lyrics',
      style: 'Test style',
      vocal: JSON.stringify({ gender: 'male' }),
    };

    const result = formatPromptForCopy(prompt);

    expect(result.fields).toEqual(['lyrics', 'style', 'vocal', 'instrumental']);
    const lines = result.text.split('\n\n');
    expect(lines[0]).toContain('lyrics:');
    expect(lines[1]).toContain('style:');
    expect(lines[2]).toContain('vocal:');
    expect(lines[3]).toContain('instrumental:');
  });

  it('should separate fields with double newlines', () => {
    const prompt = {
      lyrics: 'Test lyrics',
      style: 'Test style',
      vocal: null,
      instrumental: null,
    };

    const result = formatPromptForCopy(prompt);

    expect(result.text).toMatch(/\n\n/);
  });
});
