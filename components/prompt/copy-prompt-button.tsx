'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard, formatPromptForCopy } from '@/lib/clipboard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { VocalParams, InstrumentalParams } from '@/lib/types/prompt';

interface CopyPromptButtonProps {
  prompt: Partial<{
    id: string;
    lyrics: string | null;
    style: string | null;
    vocal: VocalParams | null;
    instrumental: InstrumentalParams | null;
  }>;
  variant?: 'icon-only' | 'with-label';
  className?: string;
}

export function CopyPromptButton({
  prompt,
  variant = 'icon-only',
  className = '',
}: CopyPromptButtonProps) {
  const [copied, setCopied] = useState(false);
  const [tracking, setTracking] = useState(false);

  const handleClick = async () => {
    if (!prompt.lyrics && !prompt.style && !prompt.vocal && !prompt.instrumental) {
      toast.error('请先填写提示词内容');
      return;
    }

    if (tracking) return;

    setTracking(true);

    try {
      const formatted = formatPromptForCopy({
        lyrics: prompt.lyrics,
        style: prompt.style,
        vocal: prompt.vocal ? JSON.stringify(prompt.vocal) : null,
        instrumental: prompt.instrumental ? JSON.stringify(prompt.instrumental) : null,
      });
      copyToClipboard(formatted.text, {
        onSuccess: () => {
          setCopied(true);
          toast.success('已复制到剪贴板');

          setTimeout(() => setCopied(false), 2000);

          if (prompt.id) {
            trackCopy(prompt.id);
          }
        },
        onError: (error) => {
          console.error('Copy failed:', error);
          toast.error('复制失败，请手动复制');
        },
      });
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('复制失败，请手动复制');
    } finally {
      setTracking(false);
    }
  };

  const hasContent = !!(prompt.lyrics || prompt.style || prompt.vocal || prompt.instrumental);

  return (
    <Button
      onClick={handleClick}
      disabled={!hasContent || tracking}
      aria-label="复制提示词到剪贴板"
      type="button"
      variant="outline"
      size={variant === 'icon-only' ? 'icon' : 'default'}
      className={cn('transition-all', className)}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" aria-hidden="true" />
          {variant === 'with-label' && <span>已复制</span>}
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" aria-hidden="true" />
          {variant === 'with-label' && <span>复制</span>}
        </>
      )}
    </Button>
  );
}

async function trackCopy(promptId: string) {
  try {
    await fetch(`/api/prompts/${promptId}/copy`, {
      method: 'POST',
    });
  } catch (error) {
    console.warn('Failed to track copy:', error);
  }
}
