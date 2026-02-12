/**
 * 质量评分算法
 * 基于规则引擎计算提示词质量分数
 */
import type { VocalParams, InstrumentalParams, QualityScore } from '../types/prompt';

/**
 * 质量评分结果
 */
export interface QualityScoreResult {
  /** 质量评分 */
  score: QualityScore;

  /** 质量警告列表 */
  warnings: string[];
}

/**
 * 章节标签列表
 */
const SECTION_TAGS = [
  '[Verse]',
  '[Chorus]',
  '[Bridge]',
  '[Intro]',
  '[Outro]',
  '[Pre-Chorus]',
  '[Hook]',
  '[Break]',
  '[Solo]',
  '[Drop]',
  '[Build-Up]',
  '[Verse 1]',
  '[Verse 2]',
  '[Verse 3]',
  '[Chorus 1]',
  '[Chorus 2]',
];

/**
 * 计算歌词中的章节标签数量
 */
function countSectionTags(lyrics: string): number {
  const count = SECTION_TAGS.filter((tag) => lyrics.includes(tag)).length;
  return count;
}

/**
 * 计算提示词质量评分
 * 返回评分（high/medium/low）和警告列表
 */
export function calculateQualityScore(
  lyrics: string | null,
  style: string | null,
  vocal: VocalParams | null,
  instrumental: InstrumentalParams | null
): QualityScoreResult {
  let score = 0;
  const warnings: string[] = [];

  // 基础分：有 lyrics 或 style (必需)
  if (!lyrics && !style) {
    return {
      score: 'low',
      warnings: ['必须提供歌词或风格'],
    };
  }

  // lyrics 评分 (30 分)
  if (lyrics) {
    const tags = countSectionTags(lyrics);
    if (tags >= 3) score += 30;
    else if (tags >= 1) score += 25;
    else score += 15;

    if (lyrics.length > 3500) {
      score = Math.max(0, score - 5);
      warnings.push('歌词超过 3500 字符，可能影响生成');
    }
  }

  // style 评分 (30 分)
  if (style) {
    if (style.length > 50) score += 30;
    else if (style.length > 10) score += 20;
    else score += 10;

    if (style.length > 2000) {
      score = Math.max(0, score - 5);
      warnings.push('风格描述超过 2000 字符');
    }
  }

  // vocal 评分 (20 分)
  if (vocal) score += 20;

  // instrumental 评分 (20 分)
  if (instrumental) score += 20;

  // 生成警告信息（仅针对缺失的可选元素）
  if (!lyrics) warnings.push('建议添加歌词以提高生成质量');
  else if (countSectionTags(lyrics) === 0)
    warnings.push('缺少章节标签，建议使用 [Verse]、[Chorus] 等');
  if (!style) warnings.push('建议添加风格描述');
  if (!vocal) warnings.push('建议添加人声参数');
  if (!instrumental) warnings.push('建议添加器乐配置');

  // 计算最终评分
  if (score >= 70) return { score: 'high', warnings };
  if (score >= 25) return { score: 'medium', warnings };
  return { score: 'low', warnings };
}

/**
 * 验证提示词数据
 * 返回是否有效（唯一硬性约束：不能完全为空）
 */
export function validatePromptData(
  lyrics: string | null,
  style: string | null
): { valid: boolean; error?: string } {
  const hasLyrics = lyrics && lyrics.trim().length > 0;
  const hasStyle = style && style.trim().length > 0;

  if (!hasLyrics && !hasStyle) {
    return {
      valid: false,
      error: '歌词和风格不能同时为空',
    };
  }

  return { valid: true };
}
