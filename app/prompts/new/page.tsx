'use client';

/**
 * 提示词创建页面
 * 用户可以在这里创建新的音乐生成提示词
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PromptForm } from '@/components/prompt/prompt-form';
import type { CreatePromptDto } from '@/lib/types/prompt';

export default function NewPromptPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdPrompt, setCreatedPrompt] = useState<any>(null);

  // 表单提交处理
  const handleSubmit = async (data: CreatePromptDto) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || '创建失败');
      }

      // 创建成功
      setCreatedPrompt(result.data);

      // 延迟跳转，让用户看到成功消息
      setTimeout(() => {
        router.push(`/prompts/${result.data.id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">创建音乐生成提示词</h1>
        <p className="text-gray-600">填写歌词、风格和参数，系统会自动计算质量评分并给出建议</p>
      </div>

      {/* 成功提示 */}
      {createdPrompt && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-900 font-medium">提示词创建成功！</p>
          <p className="text-green-700 text-sm mt-1">即将跳转到详情页...</p>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-900 font-medium">创建失败</p>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* 提示词表单 */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <PromptForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>

      {/* 使用提示 */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">使用提示</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>至少需要填写歌词或风格描述</li>
          <li>使用章节标签（如 [Verse]、[Chorus]）可以提高生成质量</li>
          <li>系统会给出质量建议，但有警告也可以保存</li>
          <li>创建后可以查看详情并关联音频输出</li>
        </ul>
      </div>
    </div>
  );
}
