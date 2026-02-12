/**
 * PromptCard 组件
 * 显示提示词摘要卡片
 */
import Link from 'next/link';
import { QualityBadge } from './quality-badge';
import type { Prompt } from '@/lib/types/prompt';

interface PromptCardProps {
  /** 提示词数据 */
  prompt: Prompt;
}

/**
 * 格式化日期
 */
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 截断文本
 */
function truncateText(text: string | null, maxLength: number = 100): string {
  if (!text) return '无内容';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function PromptCard({ prompt }: PromptCardProps) {
  return (
    <Link href={`/prompts/${prompt.id}`} className="h-full">
      <div className="group bg-white p-5 rounded-lg border hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
        {/* 头部：质量和日期 */}
        <div className="flex items-start justify-between mb-3">
          <QualityBadge score={prompt.qualityScore} />
          <time className="text-xs text-gray-500">{formatDate(prompt.createdAt)}</time>
        </div>

        {/* 歌词预览 */}
        {prompt.lyrics && (
          <div className="mb-3">
            <h4 className="text-xs font-medium text-gray-700 mb-1">歌词</h4>
            <p className="text-sm text-gray-600 font-mono line-clamp-2">
              {truncateText(prompt.lyrics, 150)}
            </p>
          </div>
        )}

        {/* 风格标签 */}
        {prompt.style && (
          <div className="mb-3">
            <h4 className="text-xs font-medium text-gray-700 mb-1">风格</h4>
            <p className="text-sm text-gray-600 line-clamp-1">{truncateText(prompt.style, 100)}</p>
          </div>
        )}

        {/* 参数预览 */}
        <div className="flex gap-2 text-xs text-gray-500 mb-3">
          {prompt.vocal && (
            <span className="bg-blue-50 px-2 py-1 rounded">
              人声: {prompt.vocal.gender || '已设置'}
            </span>
          )}
          {prompt.instrumental && (
            <span className="bg-purple-50 px-2 py-1 rounded">
              器乐: {prompt.instrumental.bpm || '已设置'} BPM
            </span>
          )}
        </div>

        {/* 警告数量 */}
        {prompt.qualityWarnings && prompt.qualityWarnings.length > 0 && (
          <div className="text-xs text-yellow-600">
            ⚠️ {prompt.qualityWarnings.length} 条改进建议
          </div>
        )}

        {/* 底部：输出数量 */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t mt-auto">
          <span className="text-xs text-gray-500">{prompt.outputs?.length || 0} 个关联输出</span>
          <span className="text-sm text-blue-600 group-hover:underline">查看详情 →</span>
        </div>
      </div>
    </Link>
  );
}
