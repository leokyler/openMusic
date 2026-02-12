/**
 * Prompt Service
 * 提示词业务逻辑层
 */
import { calculateQualityScore, validatePromptData } from '../models/quality-scorer';
import { Prisma } from '@prisma/client';
import type { Prompt, CreatePromptDto, PromptListOptions } from '../types/prompt';
import type { PaginatedResult } from '../types/common';

/**
 * Prompt Service 类
 */
export class PromptService {
  /**
   * 创建提示词并计算质量评分
   */
  async createPrompt(data: CreatePromptDto): Promise<Prompt> {
    // 验证数据
    const validation = validatePromptData(data.lyrics || null, data.style || null);
    if (!validation.valid) {
      throw new Error(validation.error || '验证失败');
    }

    // 计算质量评分
    const qualityResult = calculateQualityScore(
      data.lyrics || null,
      data.style || null,
      data.vocal || null,
      data.instrumental || null
    );

    // 延迟获取 Prisma 客户端
    const { prisma } = await import('../prisma');

    // 创建提示词
    const prompt = await prisma.prompt.create({
      data: {
        lyrics: data.lyrics,
        style: data.style,
        vocal: data.vocal || Prisma.DbNull,
        instrumental: data.instrumental || Prisma.DbNull,
        qualityScore: qualityResult.score,
        qualityWarnings: qualityResult.warnings,
      },
    });

    return prompt as Prompt;
  }

  /**
   * 根据 ID 获取提示词详情（包含 outputs）
   */
  async getPromptById(id: string): Promise<Prompt | null> {
    // 延迟获取 Prisma 客户端
    const { prisma } = await import('../prisma');

    const prompt = await prisma.prompt.findUnique({
      where: { id },
      include: {
        outputs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return prompt as Prompt | null;
  }

  /**
   * 分页列表查询，支持过滤和排序
   */
  async listPrompts(options: PromptListOptions = {}): Promise<PaginatedResult<Prompt>> {
    const {
      page = 1,
      pageSize = 20,
      qualityScore,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const where = qualityScore ? { qualityScore } : {};

    // 延迟获取 Prisma 客户端
    const { prisma } = await import('../prisma');

    const [items, total] = await Promise.all([
      prisma.prompt.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: {
            select: { outputs: true },
          },
        },
      }),
      prisma.prompt.count({ where }),
    ]);

    // 为每个 item 添加 outputCount
    const promptsWithCount = items.map((item: any) => ({
      ...item,
      outputCount: item._count.outputs,
    }));

    return {
      items: promptsWithCount as Prompt[],
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}

// 导出单例（也在运行时初始化）
export const promptService = new PromptService();
