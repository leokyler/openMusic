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

  // lyrics 评分 (40 分)
  if (lyrics) {
    const tags = countSectionTags(lyrics);
    if (tags >= 3) score += 40;
    else if (tags >= 1) score += 20;
    else warnings.push('缺少章节标签，建议使用 [Verse]、[Chorus] 等');

    if (lyrics.length > 3500) {
      score -= 10;
      warnings.push('歌词超过 3500 字符，可能影响生成');
    }
  } else {
    warnings.push('建议添加歌词以提高生成质量');
  }

  // style 评分 (30 分)
  if (style) {
    if (style.length > 50) score += 30;
    else if (style.length > 10) score += 15;

    if (style.length > 2000) {
      score -= 10;
      warnings.push('风格描述超过 2000 字符');
    }
  } else {
    warnings.push('建议添加风格描述');
  }

  // vocal 评分 (15 分)
  if (vocal) score += 15;
  else warnings.push('建议添加人声参数');

  // instrumental 评分 (15 分)
  if (instrumental) score += 15;
  else warnings.push('建议添加器乐配置');

  // 计算最终评分
  if (score >= 80) return { score: 'high', warnings };
  if (score >= 50) return { score: 'medium', warnings };
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
  // 唯一硬性约束：至少提供 lyrics 或 style
  if (!lyrics && !style) {
    return {
      valid: false,
      error: '必须提供歌词或风格',
    };
  }

  // 可选：检查是否真的是空字符串
  if (lyrics === '' && style === '') {
    return {
      valid: false,
      error: '歌词和风格不能同时为空',
    };
  }

  return { valid: true };
}
