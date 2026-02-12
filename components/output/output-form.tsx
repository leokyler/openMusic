'use client';

/**
 * OutputForm 组件
 * 关联音频输出的表单
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { GenerationParams } from '@/lib/types/output';

interface OutputFormProps {
  /** 提示词ID */
  promptId: string;
  /** 表单提交处理 */
  onSubmit: (data: {
    audioUrl: string;
    modelVersion?: string;
    generationParams?: GenerationParams;
  }) => Promise<void>;
  /** 提交按钮文本 */
  submitLabel?: string;
  /** 是否正在提交 */
  isSubmitting?: boolean;
  /** 取消回调 */
  onCancel?: () => void;
}

export function OutputForm({
  promptId,
  onSubmit,
  submitLabel = '关联输出',
  isSubmitting = false,
  onCancel,
}: OutputFormProps) {
  // 表单状态
  const [audioUrl, setAudioUrl] = useState('');
  const [modelVersion, setModelVersion] = useState('Music-2.5');
  const [generationParams, setGenerationParams] = useState('');

  // URL验证
  const [urlError, setUrlError] = useState<string | null>(null);

  // 验证URL格式
  const validateUrl = (url: string): boolean => {
    if (!url.trim()) {
      setUrlError('音频 URL 不能为空');
      return false;
    }

    try {
      new URL(url);
      setUrlError(null);
      return true;
    } catch {
      setUrlError('URL 格式不正确');
      return false;
    }
  };

  // 表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证URL
    if (!validateUrl(audioUrl)) {
      return;
    }

    // 解析生成参数（可选）
    let params: GenerationParams | undefined;
    if (generationParams.trim()) {
      try {
        params = JSON.parse(generationParams);
      } catch {
        alert('生成参数 JSON 格式不正确');
        return;
      }
    }

    // 提交
    await onSubmit({
      audioUrl: audioUrl.trim(),
      modelVersion: modelVersion.trim() || undefined,
      generationParams: params,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-5 rounded-lg border">
      <h3 className="text-lg font-medium text-gray-900 mb-4">关联音频输出</h3>

      {/* 音频URL */}
      <div className="space-y-2">
        <label htmlFor="audioUrl" className="block text-sm font-medium">
          音频 URL <span className="text-red-500">*</span>
        </label>
        <Input
          id="audioUrl"
          type="url"
          value={audioUrl}
          onChange={(e) => {
            setAudioUrl(e.target.value);
            if (urlError) validateUrl(e.target.value);
          }}
          placeholder="https://file.hailuoai.com/audio/..."
          className={urlError ? 'border-red-500' : ''}
        />
        {urlError && <p className="text-sm text-red-600">{urlError}</p>}
        <p className="text-xs text-gray-500">从 Minimax 生成的音频文件 URL</p>
      </div>

      {/* 模型版本 */}
      <div className="space-y-2">
        <label htmlFor="modelVersion" className="block text-sm font-medium">
          模型版本
        </label>
        <Input
          id="modelVersion"
          value={modelVersion}
          onChange={(e) => setModelVersion(e.target.value)}
          placeholder="Music-2.5"
        />
      </div>

      {/* 生成参数 */}
      <div className="space-y-2">
        <label htmlFor="generationParams" className="block text-sm font-medium">
          生成参数（JSON，可选）
        </label>
        <Textarea
          id="generationParams"
          value={generationParams}
          onChange={(e) => setGenerationParams(e.target.value)}
          placeholder={`{
  "seed": 12345,
  "temperature": 0.8
}`}
          rows={4}
          className="font-mono text-sm"
        />
        <p className="text-xs text-gray-500">输入 JSON 格式的生成参数，留空则不记录</p>
      </div>

      {/* 按钮 */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            取消
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || !audioUrl.trim()}>
          {isSubmitting ? '提交中...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
