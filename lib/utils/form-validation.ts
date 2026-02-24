/**
 * 表单验证逻辑
 * 前端和后端验证规则
 */
import { LyricSectionTags, type VocalParams, type InstrumentalParams } from '../types/prompt';

/**
 * 验证提示词表单数据
 */
export interface PromptFormData {
  lyrics: string;
  style: string;
  vocal?: {
    gender?: string;
    timbre?: string;
    style?: string;
  };
  instrumental?: {
    instruments?: string;
    bpm?: number;
  };
}

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误列表 */
  errors: string[];
  /** 警告列表（不阻止保存） */
  warnings: string[];
}

/**
 * 验证提示词表单
 */
export function validatePromptForm(data: PromptFormData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 硬性约束：必须至少有lyrics或style
  if (!data.lyrics && !data.style) {
    errors.push('必须提供歌词或风格');
    return { valid: false, errors, warnings };
  }

  // 歌词验证
  if (data.lyrics) {
    if (data.lyrics.length > 3500) {
      errors.push('歌词超过 3500 字符限制');
    }

    // 检查章节标签（警告）
    const sectionTags = Object.values(LyricSectionTags).map((t) => t.toLowerCase());
    const lyricsLower = data.lyrics.toLowerCase();
    const hasSectionTag = sectionTags.some((tag) => lyricsLower.includes(tag));
    const sectionTagsDisplay = sectionTags.map((t) => `[${t}]`).join('、');
    if (!hasSectionTag && data.lyrics.length > 20) {
      warnings.push(`缺少歌词章节标签，建议使用 ${sectionTagsDisplay} 等`);
    }
  }

  // 风格验证
  if (data.style && data.style.length > 2000) {
    errors.push('风格描述超过 2000 字符限制');
  }

  // 人声参数验证（如果填写了部分字段）
  if (data.vocal?.gender || data.vocal?.timbre || data.vocal?.style) {
    if (!data.vocal.timbre && !data.vocal.style) {
      warnings.push('建议填写完整的人声参数（音色或风格）');
    }
  } else {
    warnings.push('建议添加人声参数以获得更好的生成效果');
  }

  // 器乐配置验证
  if (data.instrumental?.instruments || data.instrumental?.bpm) {
    // BPM 范围检查
    if (data.instrumental.bpm && (data.instrumental.bpm < 40 || data.instrumental.bpm > 240)) {
      errors.push('BPM 必须在 40-240 之间');
    }
  } else {
    warnings.push('建议添加器乐配置以获得更好的生成效果');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 格式化vocal参数
 */
export function formatVocalParams(vocal?: PromptFormData['vocal']): VocalParams | null {
  if (!vocal || (!vocal.gender && !vocal.timbre && !vocal.style)) {
    return null;
  }

  return {
    gender: (vocal.gender as any) || undefined,
    timbre: vocal.timbre || undefined,
    style: vocal.style || undefined,
  };
}

/**
 * 格式化instrumental参数
 */
export function formatInstrumentalParams(
  instrumental?: PromptFormData['instrumental']
): InstrumentalParams | null {
  if (!instrumental || (!instrumental.instruments && !instrumental.bpm)) {
    return null;
  }

  return {
    instruments: instrumental.instruments
      ? instrumental.instruments.split(',').map((s) => s.trim())
      : undefined,
    bpm: instrumental.bpm || undefined,
  };
}
