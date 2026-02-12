/**
 * POST /api/prompts/[id]/outputs
 * 关联新输出
 */
import { outputService } from '@/lib/services/output.service';
import { validateOutputCreate } from '@/lib/middleware/validation';
import { handleError } from '@/lib/middleware/error-handler';
import { createdResponse, successResponse, notFoundResponse } from '@/lib/utils/api-response';
import { promptService } from '@/lib/services/prompt.service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: promptId } = await params;
    const body = await request.json();

    // 验证数据
    const data = validateOutputCreate(body);
    data.promptId = promptId;

    // 额外验证
    const validation = outputService.validateOutputData(data);
    if (!validation.valid) {
      return notFoundResponse(validation.error || '验证失败');
    }

    // 创建输出
    const output = await outputService.createOutput(data);

    return createdResponse(output);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * GET /api/prompts/[id]/outputs
 * 获取提示词的所有输出
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: promptId } = await params;

    // 验证提示词存在
    const prompt = await promptService.getPromptById(promptId);
    if (!prompt) {
      return notFoundResponse('提示词不存在', { id: promptId });
    }

    // 获取输出列表
    const outputs = await outputService.getOutputsByPromptId(promptId);

    return successResponse(outputs);
  } catch (error) {
    return handleError(error);
  }
}
