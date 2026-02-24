/**
 * Prompt 类型定义
 * 定义提示词相关的 TypeScript 接口
 */

/**
 * 歌词章节列表
 */
export enum LyricSectionTags {
  Intro = 'Intro',
  Verse = 'Verse',
  PreChorus = 'Pre-chorus',
  Chorus = 'Chorus',
  Hook = 'Hook',
  Drop = 'Drop',
  Bridge = 'Bridge',
  Solo = 'Solo',
  BuildUp = 'Build-up',
  Instrumental = 'Instrumental',
  Breakdown = 'Breakdown',
  Break = 'Break',
  Interlude = 'Interlude',
  Outro = 'Outro',
}

/**
 * 人声参数配置
 */
export interface VocalParams {
  /** 性别：男声、女声或其他 */
  gender?: 'male' | 'female' | 'other';

  /** 音色描述（如：温暖、清澈、沙哑） */
  timbre?: string;

  /** 演唱风格（如：抒情、高亢、说唱） */
  style?: string;

  /** 音频效果 */
  effects?: {
    /** 混响类型（如：hall, room, plate） */
    reverb?: string;

    /** 是否启用自动调音 */
    autoTune?: boolean;

    /** 其他效果参数 */
    [key: string]: any;
  };

  /** 扩展字段 */
  [key: string]: any;
}

/**
 * 器乐配置参数
 */
export interface InstrumentalParams {
  /** 乐器列表（如：piano, guitar, drums） */
  instruments?: string[];

  /** BPM（每分钟拍数） */
  bpm?: number;

  /** 制作参数（如：acoustic, electric, orchestral） */
  production?: string;

  /** 扩展字段 */
  [key: string]: any;
}

/**
 * 质量评分枚举
 */
export type QualityScore = 'high' | 'medium' | 'low';

/**
 * 提示词实体（完整）
 */
export interface Prompt {
  /** UUID */
  id: string;

  /** 语义化版本号 */
  version: string;

  /** 歌词（支持章节标签） */
  lyrics: string | null;

  /** 风格描述 */
  style: string | null;

  /** 人声参数 */
  vocal: VocalParams | null;

  /** 器乐配置 */
  instrumental: InstrumentalParams | null;

  /** 质量评分 */
  qualityScore: QualityScore;

  /** 质量警告列表 */
  qualityWarnings: string[];

  /** 复制次数 */
  copyCount: number;

  /** 最后复制时间 */
  lastCopiedAt: Date | null;

  /** 关联的输出列表（可选） */
  outputs?: Output[];

  /** 创建时间 */
  createdAt: Date;

  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 创建提示词的 DTO（Data Transfer Object）
 */
export interface CreatePromptDto {
  /** 歌词（可选） */
  lyrics?: string | null;

  /** 风格描述（可选） */
  style?: string | null;

  /** 人声参数（可选） */
  vocal?: VocalParams | null;

  /** 器乐配置（可选） */
  instrumental?: InstrumentalParams | null;
}

/**
 * 提示词列表查询选项
 */
export interface PromptListOptions {
  /** 页码（从 1 开始） */
  page?: number;

  /** 每页数量 */
  pageSize?: number;

  /** 质量过滤 */
  qualityScore?: QualityScore;

  /** 排序字段 */
  sortBy?: 'createdAt' | 'updatedAt';

  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Output 类型前向声明（用于避免循环依赖）
 */
export interface Output {
  id: string;
  promptId: string;
  audioUrl: string;
  modelVersion: string;
  generationParams: any;
  createdAt: Date;
}
