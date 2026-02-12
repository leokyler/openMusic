/**
 * GET /api/prompts/[id]
 * 获取单个提示词详情
 */
import { promptService } from '@/lib/services/prompt.service';
import { handleError } from '@/lib/middleware/error-handler';
import { successResponse, notFoundResponse } from '@/lib/utils/api-response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // 获取提示词详情
    const prompt = await promptService.getPromptById(id);

    if (!prompt) {
      return notFoundResponse('提示词不存在', { id });
    }

    return successResponse(prompt);
  } catch (error) {
    return handleError(error);
  }
}
