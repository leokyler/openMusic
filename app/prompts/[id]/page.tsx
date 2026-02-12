/**
 * 提示词详情页面
 * 显示单个提示词的完整信息
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PromptDetail } from '@/components/prompt/prompt-detail';
import { PromptDetailSkeleton } from '@/components/skeleton';
import type { Prompt } from '@/lib/types/prompt';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PromptDetailPage({ params }: PageProps) {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取提示词详情
  useEffect(() => {
    const fetchPrompt = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { id } = await params;
        const response = await fetch(`/api/prompts/${id}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || '获取失败');
        }

        setPrompt(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompt();
  }, [params]);

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
      {/* 返回按钮 */}
      <div className="mb-4 sm:mb-6">
        <Link
          href="/prompts"
          className="inline-flex items-center text-blue-600 hover:underline text-sm sm:text-base"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          返回列表
        </Link>
      </div>

      {/* 加载状态 */}
      {isLoading && <PromptDetailSkeleton />}

      {/* 错误状态 */}
      {error && (
        <div className="text-center py-12 sm:py-16 px-4">
          <div className="text-4xl sm:text-6xl mb-4">❌</div>
          <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">获取失败</h3>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">{error}</p>
          <Link
            href="/prompts"
            className="inline-block px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
          >
            返回列表
          </Link>
        </div>
      )}

      {/* 提示词详情 */}
      {!isLoading && !error && prompt && <PromptDetail prompt={prompt} />}
    </div>
  );
}
