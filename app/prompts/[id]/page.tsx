/**
 * 提示词详情页面
 * 显示单个提示词的完整信息
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PromptDetail } from '@/components/prompt/prompt-detail';
import type { Prompt } from '@/lib/types/prompt';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PromptDetailPage({ params }: PageProps) {
  const router = useRouter();
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 返回按钮 */}
      <div className="mb-6">
        <Link href="/prompts" className="text-blue-600 hover:underline">
          ← 返回列表
        </Link>
      </div>

      {/* 加载状态 */}
      {isLoading && (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">加载中...</p>
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">获取失败</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/prompts"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回列表
          </Link>
        </div>
      )}

      {/* 提示词详情 */}
      {!isLoading && !error && prompt && (
        <>
          <PromptDetail prompt={prompt} />

          {/* 操作按钮 */}
          <div className="mt-8 flex justify-end gap-3">
            {/* 关联输出按钮（Phase 5添加） */}
            <button
              onClick={() => {
                // TODO: 实现关联输出功能
                alert('关联输出功能将在 Phase 5 实现');
              }}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              关联音频输出
            </button>
          </div>
        </>
      )}
    </div>
  );
}
