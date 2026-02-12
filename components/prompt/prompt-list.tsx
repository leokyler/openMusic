/**
 * PromptList 组件
 * 渲染提示词列表和分页控制
 */
'use client';

import Link from 'next/link';
import { PromptCard } from './prompt-card';
import { PromptListSkeleton } from '../skeleton';
import type { Prompt } from '@/lib/types/prompt';
import type { PaginatedResult } from '@/lib/types/common';

interface PromptListProps {
  /** 分页结果 */
  result: PaginatedResult<Prompt>;
  /** 页码改变回调 */
  onPageChange?: (page: number) => void;
  /** 是否正在加载 */
  isLoading?: boolean;
}

export function PromptList({ result, onPageChange, isLoading = false }: PromptListProps) {
  const { items, page, pageSize, total, totalPages } = result;

  // 加载状态 - 显示骨架屏
  if (isLoading && items.length === 0) {
    return <PromptListSkeleton count={pageSize} />;
  }

  // 空状态
  if (items.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12 sm:py-16 px-4">
        <div className="text-4xl sm:text-6xl mb-4">📝</div>
        <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">还没有提示词</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-6">
          创建你的第一个音乐生成提示词开始吧
        </p>
        <Link
          href="/prompts/new"
          className="inline-block px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
        >
          创建提示词
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 提示词列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
        {isLoading && <PromptListSkeleton count={Math.min(3, pageSize - items.length)} />}
      </div>

      {/* 分页控制 */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-lg border">
          {/* 当前页信息 */}
          <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
            第 <span className="font-medium">{page}</span> 页， 共{' '}
            <span className="font-medium">{totalPages}</span> 页 （
            <span className="font-medium">{total}</span> 条记录）
          </div>

          {/* 分页按钮 */}
          <div className="flex gap-2 justify-center sm:justify-end">
            <button
              onClick={() => onPageChange && onPageChange(page - 1)}
              disabled={page <= 1 || isLoading}
              className="px-3 sm:px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-xs sm:text-sm"
            >
              上一页
            </button>
            <button
              onClick={() => onPageChange && onPageChange(page + 1)}
              disabled={page >= totalPages || isLoading}
              className="px-3 sm:px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-xs sm:text-sm"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
