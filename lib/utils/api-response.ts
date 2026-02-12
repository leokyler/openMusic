/**
 * API 响应工具
 * 标准化 JSON 响应格式
 */
import type { ApiResponse } from '../types/common';

/**
 * 创建成功响应
 */
export function successResponse<T>(
  data: T,
  meta?: { timestamp?: string; version?: string }
): Response {
  return Response.json(
    {
      success: true,
      data,
      meta: {
        timestamp: meta?.timestamp || new Date().toISOString(),
        version: meta?.version || '1.0.0',
      },
    } as ApiResponse<T>,
    { status: 200 }
  );
}

/**
 * 创建创建成功响应（201）
 */
export function createdResponse<T>(
  data: T,
  meta?: { timestamp?: string; version?: string }
): Response {
  return Response.json(
    {
      success: true,
      data,
      meta: {
        timestamp: meta?.timestamp || new Date().toISOString(),
        version: meta?.version || '1.0.0',
      },
    } as ApiResponse<T>,
    { status: 201 }
  );
}

/**
 * 创建错误响应
 */
export function errorResponse(
  code: string,
  message: string,
  details?: any,
  status: number = 400
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

/**
 * 400 Bad Request
 */
export function badRequestResponse(message: string, details?: any): Response {
  return errorResponse('BAD_REQUEST', message, details, 400);
}

/**
 * 404 Not Found
 */
export function notFoundResponse(message: string = '资源不存在', details?: any): Response {
  return errorResponse('NOT_FOUND', message, details, 404);
}

/**
 * 500 Internal Server Error
 */
export function internalErrorResponse(
  message: string = '服务器内部错误，请稍后重试',
  details?: any
): Response {
  return errorResponse('INTERNAL_ERROR', message, details, 500);
}

/**
 * 验证错误响应
 */
export function validationErrorResponse(field: string, error: string): Response {
  return errorResponse('VALIDATION_ERROR', '请求参数验证失败', { field, error }, 400);
}
