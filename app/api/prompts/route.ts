/**
 * POST /api/prompts
 * 创建新提示词
 */
import { promptService } from '@/lib/services/prompt.service';
import { validatePromptCreate } from '@/lib/middleware/validation';
import { handleError } from '@/lib/middleware/error-handler';
import { createdResponse, successResponse } from '@/lib/utils/api-response';

export async function POST(request: Request) {
  try {
    // 解析请求体
    const body = await request.json();

    // 验证数据
    const data = validatePromptCreate(body);

    // 创建提示词
    const prompt = await promptService.createPrompt(data);

    return createdResponse(prompt);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * GET /api/prompts
 * 获取提示词列表（支持分页和过滤）
 */
import type { PromptListOptions } from '@/lib/types/prompt';

export async function GET(request: Request) {
  try {
    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const options: PromptListOptions = {
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '20'),
      qualityScore: (searchParams.get('qualityScore') as any) || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
    };

    // 获取列表
    const result = await promptService.listPrompts(options);

    return successResponse(result);
  } catch (error) {
    return handleError(error);
  }
}
