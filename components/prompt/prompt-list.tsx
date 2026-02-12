/**
 * PromptList 组件
 * 渲染提示词列表和分页控制
 */
'use client';

import Link from 'next/link';
import { PromptCard } from './prompt-card';
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

  // 空状态
  if (items.length === 0 && !isLoading) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">还没有提示词</h3>
        <p className="text-gray-600 mb-6">创建你的第一个音乐生成提示词开始吧</p>
        <Link
          href="/prompts/new"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
      </div>

      {/* 分页控制 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
          {/* 当前页信息 */}
          <div className="text-sm text-gray-600">
            第 <span className="font-medium">{page}</span> 页， 共{' '}
            <span className="font-medium">{totalPages}</span> 页 （
            <span className="font-medium">{total}</span> 条记录）
          </div>

          {/* 分页按钮 */}
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange && onPageChange(page - 1)}
              disabled={page <= 1 || isLoading}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              上一页
            </button>
            <button
              onClick={() => onPageChange && onPageChange(page + 1)}
              disabled={page >= totalPages || isLoading}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              下一页
            </button>
          </div>
        </div>
      )}

      {/* 加载状态 */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-2">加载中...</p>
        </div>
      )}
    </div>
  );
}
