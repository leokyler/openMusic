/**
 * 通用类型定义
 * 定义全局共享的 TypeScript 接口
 */

import type { QualityScore } from './prompt';

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  /** 数据列表 */
  items: T[];

  /** 当前页码 */
  page: number;

  /** 每页数量 */
  pageSize: number;

  /** 总记录数 */
  total: number;

  /** 总页数 */
  totalPages: number;
}

/**
 * API 响应格式
 */
export interface ApiResponse<T = any> {
  /** 是否成功 */
  success: boolean;

  /** 响应数据 */
  data?: T;

  /** 错误信息 */
  error?: {
    /** 错误代码 */
    code: string;

    /** 错误描述 */
    message: string;

    /** 详细错误信息 */
    details?: any;
  };

  /** 元数据 */
  meta?: {
    /** 响应时间戳 */
    timestamp: string;

    /** API 版本 */
    version: string;
  };
}

/**
 * 质量评分结果
 */
export interface QualityScoreResult {
  /** 质量评分 */
  score: QualityScore;

  /** 质量警告列表 */
  warnings: string[];
}
