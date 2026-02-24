/**
 * PromptDetail 组件
 * 显示提示词完整详情（包括关联输出）
 */
'use client';

import { useState } from 'react';
import { ValidationAlert } from './validation-alert';
import { QualityBadge } from './quality-badge';
import { CopyPromptButton } from './copy-prompt-button';
import { OutputList } from '../output/output-list';
import { OutputForm } from '../output/output-form';
import type { Prompt, Output } from '@/lib/types/prompt';
import type { CreateOutputDto } from '@/lib/types/output';

interface PromptDetailProps {
  /** 提示词数据 */
  prompt: Prompt;
}

/**
 * 格式化JSON显示
 */
function formatJson(data: any): string {
  if (!data) return '未设置';
  return JSON.stringify(data, null, 2);
}

export function PromptDetail({ prompt }: PromptDetailProps) {
  const [showOutputForm, setShowOutputForm] = useState(false);
  const [outputs, setOutputs] = useState<Output[]>((prompt as any).outputs || []);

  // 提交新输出
  const handleOutputSubmit = async (data: Omit<CreateOutputDto, 'promptId'>) => {
    try {
      const submitData: CreateOutputDto = {
        ...data,
        promptId: prompt.id,
      };

      const response = await fetch(`/api/prompts/${prompt.id}/outputs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || '关联失败');
      }

      // 添加到输出列表
      setOutputs([{ ...result.data, createdAt: new Date() }, ...outputs]);
      setShowOutputForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : '关联失败');
    }
  };

  return (
    <div className="space-y-6">
      {/* 头部信息 */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">提示词详情</h2>
            <CopyPromptButton prompt={prompt} variant="icon-only" />
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
            <span>版本: {prompt.version}</span>
            <span>•</span>
            <span>创建于 {new Date(prompt.createdAt).toLocaleString('zh-CN')}</span>
            {prompt.updatedAt !== prompt.createdAt && (
              <>
                <span>•</span>
                <span>更新于 {new Date(prompt.updatedAt).toLocaleString('zh-CN')}</span>
              </>
            )}
            {(prompt as any).copyCount > 0 && (
              <>
                <span>•</span>
                <span>
                  已复制 {(prompt as any).copyCount} 次
                  {(prompt as any).lastCopiedAt &&
                    `，最后复制于 ${new Date((prompt as any).lastCopiedAt).toLocaleString('zh-CN')}`}
                </span>
              </>
            )}
          </div>
        </div>
        <QualityBadge score={prompt.qualityScore} />
      </div>

      {/* 质量警告 */}
      {prompt.qualityWarnings && prompt.qualityWarnings.length > 0 && (
        <ValidationAlert warnings={prompt.qualityWarnings} />
      )}

      {/* 歌词 */}
      {prompt.lyrics && (
        <div className="bg-white p-5 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-700 mb-2">歌词</h3>
          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 bg-gray-50 p-4 rounded overflow-x-auto">
            {prompt.lyrics}
          </pre>
        </div>
      )}

      {/* 风格 */}
      {prompt.style && (
        <div className="bg-white p-5 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-700 mb-2">风格描述</h3>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{prompt.style}</p>
        </div>
      )}

      {/* 人声参数 */}
      {prompt.vocal && (
        <div className="bg-white p-5 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-700 mb-2">人声参数</h3>
          <pre className="text-sm text-gray-800 bg-gray-50 p-4 rounded overflow-x-auto">
            {formatJson(prompt.vocal)}
          </pre>
        </div>
      )}

      {/* 器乐配置 */}
      {prompt.instrumental && (
        <div className="bg-white p-5 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-700 mb-2">器乐配置</h3>
          <pre className="text-sm text-gray-800 bg-gray-50 p-4 rounded overflow-x-auto">
            {formatJson(prompt.instrumental)}
          </pre>
        </div>
      )}

      {/* 复制按钮（底部） */}
      <div className="flex justify-end">
        <CopyPromptButton prompt={prompt} variant="with-label" />
      </div>

      {/* 关联输出部分 */}
      <div className="bg-white p-5 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            关联的音频输出（{outputs.length} 个）
          </h3>
          {!showOutputForm && (
            <button
              onClick={() => setShowOutputForm(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
            >
              + 关联新输出
            </button>
          )}
        </div>

        {/* 输出表单 */}
        {showOutputForm && (
          <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-purple-900">关联音频输出</h4>
              <button
                onClick={() => setShowOutputForm(false)}
                className="text-purple-600 hover:underline text-sm"
              >
                取消
              </button>
            </div>
            <OutputForm
              promptId={prompt.id}
              onSubmit={handleOutputSubmit}
              submitLabel="关联输出"
              onCancel={() => setShowOutputForm(false)}
            />
          </div>
        )}

        {/* 输出列表 */}
        {outputs.length > 0 ? (
          <OutputList outputs={outputs} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>还没有关联的音频输出</p>
            <p className="text-sm mt-1">使用 Minimax 生成音乐后，点击上方"关联新输出"按钮添加</p>
          </div>
        )}
      </div>
    </div>
  );
}
