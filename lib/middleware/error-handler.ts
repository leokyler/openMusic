/**
 * API 错误处理中间件
 * 统一处理应用中的错误
 */
import { internalErrorResponse } from '../utils/api-response';
import type { ApiResponse } from '../types/common';

/**
 * HTTP 错误类
 */
export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/**
 * 验证错误类
 */
export class ValidationError extends Error {
  constructor(
    public field: string,
    message: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Prisma 错误码映射
 */
const PRISMA_ERROR_MAP: Record<string, { code: string; message: string }> = {
  P2002: {
    code: 'DUPLICATE_RECORD',
    message: '记录已存在',
  },
  P2025: {
    code: 'NOT_FOUND',
    message: '记录不存在',
  },
  P2003: {
    code: 'FOREIGN_KEY_CONSTRAINT',
    message: '外键约束失败',
  },
};

/**
 * 处理并返回错误响应
 */
export function handleError(error: unknown): Response {
  console.error('Error occurred:', error);

  // HTTP 错误
  if (error instanceof HttpError) {
    return errorResponse(
      error.statusCode.toString(),
      error.message,
      error.details,
      error.statusCode
    );
  }

  // 验证错误
  if (error instanceof ValidationError) {
    return errorResponse(
      'VALIDATION_ERROR',
      '请求参数验证失败',
      { field: error.field, error: error.message },
      400
    );
  }

  // Prisma 错误
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; message?: string };
    const mappedError = PRISMA_ERROR_MAP[prismaError.code];

    if (mappedError) {
      return errorResponse(mappedError.code, mappedError.message, prismaError, 400);
    }
  }

  // 通用错误
  return internalErrorResponse();
}

/**
 * 错误响应构造函数
 */
function errorResponse(
  code: string,
  message: string,
  details?: any,
  status: number = 500
): Response {
  return Response.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    } as ApiResponse,
    { status }
  );
}
