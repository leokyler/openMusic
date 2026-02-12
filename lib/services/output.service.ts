/**
 * Output Service
 * 输出关联业务逻辑层
 */
import { prisma } from '../prisma';
import type { Output, CreateOutputDto } from '../types/output';

/**
 * Output Service 类
 */
export class OutputService {
  /**
   * 创建输出并关联到提示词
   */
  async createOutput(data: CreateOutputDto): Promise<Output> {
    // 验证提示词存在
    const prompt = await prisma.prompt.findUnique({
      where: { id: data.promptId },
    });

    if (!prompt) {
      throw new Error(`提示词 ${data.promptId} 不存在`);
    }

    // 创建输出
    const output = await prisma.output.create({
      data: {
        promptId: data.promptId,
        audioUrl: data.audioUrl,
        modelVersion: data.modelVersion || 'Music-2.5',
        generationParams: data.generationParams || {},
      },
    });

    return output as Output;
  }

  /**
   * 获取提示词的所有输出
   */
  async getOutputsByPromptId(promptId: string): Promise<Output[]> {
    const outputs = await prisma.output.findMany({
      where: { promptId },
      orderBy: { createdAt: 'desc' },
    });

    return outputs as Output[];
  }

  /**
   * 验证输出数据
   */
  validateOutputData(data: CreateOutputDto): { valid: boolean; error?: string } {
    // 验证 audioUrl 格式
    if (!data.audioUrl || !data.audioUrl.trim()) {
      return { valid: false, error: '音频 URL 不能为空' };
    }

    try {
      new URL(data.audioUrl);
    } catch {
      return { valid: false, error: '音频 URL 格式不正确' };
    }

    // 验证 URL 长度
    if (data.audioUrl.length > 500) {
      return { valid: false, error: '音频 URL 超过 500 字符限制' };
    }

    // 验证 BPM 范围（如果提供）
    if (
      data.generationParams?.bpm &&
      (data.generationParams.bpm < 40 || data.generationParams.bpm > 240)
    ) {
      return { valid: false, error: 'BPM 必须在 40-240 之间' };
    }

    return { valid: true };
  }
}

// 导出单例
export const outputService = new OutputService();
