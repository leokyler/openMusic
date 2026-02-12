/**
 * 提示词列表页面
 * 显示所有提示词，支持分页和过滤
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PromptList } from '@/components/prompt/prompt-list';
import type { Prompt, PromptListOptions } from '@/lib/types/prompt';
import type { PaginatedResult } from '@/lib/types/common';
import Link from 'next/link';

export default function PromptsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 状态
  const [result, setResult] = useState<PaginatedResult<Prompt>>({
    items: [],
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取列表数据
  const fetchPrompts = async (options: PromptListOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.page) params.set('page', options.page.toString());
      if (options.pageSize) params.set('pageSize', options.pageSize.toString());
      if (options.qualityScore) params.set('qualityScore', options.qualityScore);
      if (options.sortBy) params.set('sortBy', options.sortBy);
      if (options.sortOrder) params.set('sortOrder', options.sortOrder);

      const response = await fetch(`/api/prompts?${params.toString()}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || '获取失败');
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加载和URL参数变化时重新获取
  useEffect(() => {
    const options: PromptListOptions = {
      page: parseInt(searchParams.get('page') || '1'),
      qualityScore:
        (searchParams.get('qualityScore') as 'high' | 'medium' | 'low' | null) || undefined,
      sortBy: (searchParams.get('sortBy') as 'createdAt' | 'updatedAt' | null) || undefined,
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc' | null) || undefined,
    };

    fetchPrompts(options);
  }, [searchParams]);

  // 页码改变处理
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/prompts?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
            音乐提示词
          </h1>
          <p className="text-sm sm:text-base text-gray-600">管理和查看你的音乐生成提示词</p>
        </div>

        {/* 创建按钮 */}
        <Link
          href="/prompts/new"
          className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm sm:text-base transition-colors"
        >
          <svg
            className="w-5 h-5 mr-1 sm:mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>创建提示词</span>
        </Link>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-900 font-medium">获取失败</p>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* 过滤器（可选） */}
      <div className="mb-6 bg-white p-4 rounded-lg border">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="quality-filter" className="block text-sm font-medium mb-1">
              质量筛选
            </label>
            <select
              id="quality-filter"
              value={searchParams.get('qualityScore') || ''}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString());
                if (e.target.value) {
                  params.set('qualityScore', e.target.value);
                } else {
                  params.delete('qualityScore');
                }
                router.push(`/prompts?${params.toString()}`);
              }}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="">全部</option>
              <option value="high">高质量</option>
              <option value="medium">中等质量</option>
              <option value="low">低质量</option>
            </select>
          </div>

          <div>
            <label htmlFor="sort-filter" className="block text-sm font-medium mb-1">
              排序方式
            </label>
            <select
              id="sort-filter"
              value={`${searchParams.get('sortBy') || 'createdAt'}-${searchParams.get('sortOrder') || 'desc'}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                const params = new URLSearchParams(searchParams.toString());
                params.set('sortBy', sortBy);
                params.set('sortOrder', sortOrder);
                router.push(`/prompts?${params.toString()}`);
              }}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="createdAt-desc">最新创建</option>
              <option value="createdAt-asc">最早创建</option>
              <option value="updatedAt-desc">最近更新</option>
              <option value="updatedAt-asc">最早更新</option>
            </select>
          </div>
        </div>
      </div>

      {/* 提示词列表 */}
      <PromptList result={result} onPageChange={handlePageChange} isLoading={isLoading} />
    </div>
  );
}
