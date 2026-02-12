/**
 * 质量评分单元测试
 * 测试评分算法和警告生成逻辑
 */
import { describe, it, expect } from 'vitest';
import { calculateQualityScore, validatePromptData } from '@/lib/models/quality-scorer';

describe('Quality Scorer', () => {
  describe('calculateQualityScore', () => {
    it('应该给高质量完整提示词评分 high', () => {
      const result = calculateQualityScore(
        `[Verse 1]
在夜空下徘徊

[Chorus]
星光闪耀，照亮前方

[Bridge]
追逐梦想的路`,
        'Pop, Acoustic, Emotional, 80-100 BPM, uplifting mood',
        { gender: 'female', timbre: '清澈、温暖', style: '抒情' },
        { instruments: ['acoustic guitar', 'piano'], bpm: 90 }
      );

      expect(result.score).toBe('high');
      expect(result.warnings).toHaveLength(0);
    });

    it('应该给中等质量提示词评分 medium', () => {
      const result = calculateQualityScore(
        `[Verse 1]
简单的歌词内容

[Chorus]
副歌部分`,
        'Pop style with moderate description',
        null,
        null
      );

      expect(result.score).toBe('medium');
      expect(result.warnings).toContain('建议添加人声参数');
      expect(result.warnings).toContain('建议添加器乐配置');
    });

    it('应该给简单但可用的提示词评分 medium', () => {
      const result = calculateQualityScore(
        '简单的歌词内容，没有章节标签',
        'Pop style with moderate description text here',
        { gender: 'male', timbre: '温暖', style: '流行' },
        null
      );

      expect(result.score).toBe('medium');
      expect(result.warnings).toContain('缺少章节标签，建议使用 [Verse]、[Chorus] 等');
    });

    it('应该给低质量提示词评分 low', () => {
      const result = calculateQualityScore('只有简单的歌词内容', null, null, null);

      expect(result.score).toBe('low');
      expect(result.warnings).toContain('缺少章节标签，建议使用 [Verse]、[Chorus] 等');
      expect(result.warnings).toContain('建议添加风格描述');
      expect(result.warnings).toContain('建议添加人声参数');
      expect(result.warnings).toContain('建议添加器乐配置');
    });

    it('应该检测章节标签并加分', () => {
      const result = calculateQualityScore(
        `[Verse 1]
First verse

[Chorus]
Chorus text`,
        null,
        null,
        null
      );

      expect(result.score).toBe('medium');
      expect(result.warnings).not.toContain('缺少章节标签，建议使用 [Verse]、[Chorus] 等');
    });

    it('应该警告超长歌词', () => {
      const longLyrics = 'x'.repeat(3600);
      const result = calculateQualityScore(longLyrics, 'Pop', null, null);

      expect(result.warnings).toContain('歌词超过 3500 字符，可能影响生成');
    });

    it('应该警告超长风格描述', () => {
      const longStyle = 'y'.repeat(2100);
      const result = calculateQualityScore(null, longStyle, null, null);

      expect(result.warnings).toContain('风格描述超过 2000 字符');
    });
  });

  describe('validatePromptData', () => {
    it('应该接受有效的歌词', () => {
      const result = validatePromptData('valid lyrics', null);
      expect(result.valid).toBe(true);
    });

    it('应该接受有效的风格', () => {
      const result = validatePromptData(null, 'valid style');
      expect(result.valid).toBe(true);
    });

    it('应该拒绝完全空的提示词', () => {
      const result = validatePromptData(null, null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('歌词和风格不能同时为空');
    });

    it('应该拒绝空字符串', () => {
      const result = validatePromptData('', '');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('歌词和风格不能同时为空');
    });

    it('应该拒绝只有空格的字符串', () => {
      const result = validatePromptData('   ', '   ');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('歌词和风格不能同时为空');
    });
  });
});
