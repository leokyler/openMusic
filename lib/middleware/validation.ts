/**
 * 验证中间件
 * 使用 JSON Schema 验证请求数据
 */
import { validatePromptCreateRequest, validateOutputCreateRequest } from '../schemas/validator';
import { ValidationError } from './error-handler';
import type { CreatePromptDto } from '../types/prompt';
import type { CreateOutputDto } from '../types/output';

/**
 * 验证提示词创建请求
 */
export function validatePromptCreate(data: unknown): CreatePromptDto {
  const result = validatePromptCreateRequest(data);

  if (!result.valid) {
    const firstError = result.errors[0];
    throw new ValidationError(firstError.path, firstError.message);
  }

  return data as CreatePromptDto;
}

/**
 * 验证输出创建请求
 */
export function validateOutputCreate(data: unknown): CreateOutputDto {
  const result = validateOutputCreateRequest(data);

  if (!result.valid) {
    const firstError = result.errors[0];
    throw new ValidationError(firstError.path, firstError.message);
  }

  return data as CreateOutputDto;
}
