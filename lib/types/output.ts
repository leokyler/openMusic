/**
 * Output 类型定义
 * 定义输出关联相关的 TypeScript 接口
 */

/**
 * 生成参数
 */
export interface GenerationParams {
  /** 随机种子（可复现生成） */
  seed?: number;

  /** 温度参数（创造性控制） */
  temperature?: number;

  /** 扩展字段 */
  [key: string]: any;
}

/**
 * 输出实体
 */
export interface Output {
  /** UUID */
  id: string;

  /** 关联的提示词 ID */
  promptId: string;

  /** 音频 URL */
  audioUrl: string;

  /** 模型版本 */
  modelVersion: string;

  /** 生成参数 */
  generationParams: GenerationParams;

  /** 创建时间 */
  createdAt: Date;
}

/**
 * 创建输出的 DTO
 */
export interface CreateOutputDto {
  /** 关联的提示词 ID */
  promptId: string;

  /** 音频 URL */
  audioUrl: string;

  /** 模型版本（可选） */
  modelVersion?: string;

  /** 生成参数（可选） */
  generationParams?: GenerationParams;
}
