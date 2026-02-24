'use client';

/**
 * PromptForm 组件
 * 创建/编辑提示词的表单
 */
import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ValidationAlert } from './validation-alert';
import { QualityBadge } from './quality-badge';
import { CopyPromptButton } from './copy-prompt-button';
import type { VocalParams, InstrumentalParams } from '@/lib/types/prompt';
import type { CreatePromptDto } from '@/lib/types/prompt';
import { LyricSectionTags } from '@/lib/types/prompt';

interface PromptFormProps {
  /** 表单提交处理 */
  onSubmit: (data: CreatePromptDto) => Promise<void>;
  /** 初始值（可选，用于编辑） */
  initialValues?: Partial<CreatePromptDto>;
  /** 提交按钮文本 */
  submitLabel?: string;
  /** 是否正在提交 */
  isSubmitting?: boolean;
  /** 是否显示复制按钮 */
  showCopyButton?: boolean;
  /** 复制按钮数据变化的回调 */
  onCopyDataChange?: (data: Partial<CreatePromptDto>) => void;
}

export function PromptForm({
  onSubmit,
  initialValues = {},
  submitLabel = '创建提示词',
  isSubmitting = false,
  showCopyButton = false,
  onCopyDataChange,
}: PromptFormProps) {
  // 表单状态
  const [lyrics, setLyrics] = useState(initialValues.lyrics || '');
  const [style, setStyle] = useState(initialValues.style || '');
  const [vocalGender, setVocalGender] = useState<'male' | 'female' | 'other'>(
    initialValues.vocal?.gender || 'other'
  );
  const [vocalTimbre, setVocalTimbre] = useState(initialValues.vocal?.timbre || '');
  const [vocalStyle, setVocalStyle] = useState(initialValues.vocal?.style || '');
  const [instruments, setInstruments] = useState(
    initialValues.instrumental?.instruments?.join(', ') || ''
  );
  const [bpm, setBpm] = useState(initialValues.instrumental?.bpm || 120);

  // 字符计数
  const lyricsCount = lyrics.length;
  const styleCount = style.length;

  // 硬性验证：必须提供歌词或风格之一
  const hasRequiredContent = lyrics.trim().length > 0 || style.trim().length > 0;

  // 验证警告（实时预览，仅用于提示）
  const sectionTags = Object.values(LyricSectionTags);
  const sectionTagsLower = sectionTags.map((t) => t.toLowerCase());
  const lyricsLower = lyrics.toLowerCase();
  const hasSectionTag = sectionTagsLower.some((tag) => lyricsLower.includes(tag));
  const sectionTagsDisplay = sectionTagsLower.map((t) => `[${t}]`).join('、');

  const warnings = [
    !hasRequiredContent ? '歌词和风格不能同时为空' : null,
    lyricsCount > 0 && !hasSectionTag
      ? `缺少歌词章节标签，建议使用 ${sectionTagsDisplay} 等`
      : null,
    lyricsCount > 3500 ? '歌词超过 3500 字符，可能影响生成' : null,
    styleCount > 2000 ? '风格描述超过 2000 字符' : null,
    styleCount === 0 ? '建议添加风格描述' : null,
    !vocalTimbre && !vocalStyle ? '建议添加人声参数' : null,
    !instruments ? '建议添加器乐配置' : null,
  ].filter(Boolean) as string[];

  // 质量评分预览
  const qualityScore = warnings.length === 0 ? 'high' : warnings.length <= 2 ? 'medium' : 'low';

  // 构建当前表单数据的回调（用于复制按钮）
  const getCurrentFormData = useCallback((): CreatePromptDto => {
    const vocal: VocalParams | null =
      vocalTimbre || vocalStyle
        ? {
            gender: vocalGender,
            timbre: vocalTimbre || undefined,
            style: vocalStyle || undefined,
          }
        : null;

    const instrumental: InstrumentalParams | null =
      instruments || bpm
        ? {
            instruments: instruments
              ? instruments.split(',').map((s: string) => s.trim())
              : undefined,
            bpm: bpm || undefined,
          }
        : null;

    return {
      lyrics: lyrics || null,
      style: style || null,
      vocal,
      instrumental,
    };
  }, [lyrics, style, vocalGender, vocalTimbre, vocalStyle, instruments, bpm]);

  // 通知父组件数据已变化（用于复制按钮）
  useEffect(() => {
    if (onCopyDataChange) {
      const vocal: VocalParams | null =
        vocalTimbre || vocalStyle
          ? {
              gender: vocalGender,
              timbre: vocalTimbre || undefined,
              style: vocalStyle || undefined,
            }
          : null;

      const instrumental: InstrumentalParams | null =
        instruments || bpm
          ? {
              instruments: instruments
                ? instruments.split(',').map((s: string) => s.trim())
                : undefined,
              bpm: bpm || undefined,
            }
          : null;

      const data: Partial<CreatePromptDto> = {
        lyrics: lyrics || null,
        style: style || null,
        vocal,
        instrumental,
      };

      onCopyDataChange(data);
    }
  }, [lyrics, style, vocalGender, vocalTimbre, vocalStyle, instruments, bpm, onCopyDataChange]);

  // 表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 构建vocal对象
    const vocal: VocalParams | null =
      vocalTimbre || vocalStyle
        ? {
            gender: vocalGender,
            timbre: vocalTimbre || undefined,
            style: vocalStyle || undefined,
          }
        : null;

    // 构建instrumental对象
    const instrumental: InstrumentalParams | null =
      instruments || bpm
        ? {
            instruments: instruments
              ? instruments.split(',').map((s: string) => s.trim())
              : undefined,
            bpm: bpm || undefined,
          }
        : null;

    // 构建DTO
    const data: CreatePromptDto = {
      lyrics: lyrics || null,
      style: style || null,
      vocal,
      instrumental,
    };

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 复制按钮（可选） */}
      {showCopyButton && (
        <div className="flex justify-end mb-4">
          <CopyPromptButton prompt={getCurrentFormData()} variant="with-label" />
        </div>
      )}

      {/* 质量评分预览 */}
      {warnings.length > 0 && (
        <div className="flex items-center gap-2">
          <QualityBadge score={qualityScore} />
          <span className="text-sm text-gray-600">预估质量：基于当前表单内容</span>
        </div>
      )}

      {/* 验证警告 */}
      <ValidationAlert warnings={warnings} />

      {/* 歌词输入 */}
      <div className="space-y-2">
        <label htmlFor="lyrics" className="block text-sm font-medium">
          歌词（支持章节标签如 [verse]、[chorus]）
          <span className="text-gray-500 ml-2">{lyricsCount} / 3500 字符</span>
        </label>
        <Textarea
          id="lyrics"
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          placeholder={`[Verse 1]\n在这里输入歌词...`}
          rows={10}
          className="font-mono text-sm"
        />
      </div>

      {/* 风格描述输入 */}
      <div className="space-y-2">
        <label htmlFor="style" className="block text-sm font-medium">
          风格描述
          <span className="text-gray-500 ml-2">{styleCount} / 2000 字符</span>
        </label>
        <Textarea
          id="style"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          placeholder="Pop, Acoustic, Emotional, 80-100 BPM"
          rows={3}
        />
      </div>

      {/* 人声参数 */}
      <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-sm font-medium">人声参数（可选）</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="vocal-gender" className="block text-sm">
              性别
            </label>
            <select
              id="vocal-gender"
              value={vocalGender}
              onChange={(e) => setVocalGender(e.target.value as 'male' | 'female' | 'other')}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="other">其他</option>
              <option value="male">男声</option>
              <option value="female">女声</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="vocal-timbre" className="block text-sm">
              音色描述
            </label>
            <Input
              id="vocal-timbre"
              value={vocalTimbre}
              onChange={(e) => setVocalTimbre(e.target.value)}
              placeholder="如：温暖、清澈、沙哑"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="vocal-style" className="block text-sm">
              演唱风格
            </label>
            <Input
              id="vocal-style"
              value={vocalStyle}
              onChange={(e) => setVocalStyle(e.target.value)}
              placeholder="如：抒情、高亢、说唱"
            />
          </div>
        </div>
      </div>

      {/* 器乐配置 */}
      <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-sm font-medium">器乐配置（可选）</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="instruments" className="block text-sm">
              乐器列表（用逗号分隔）
            </label>
            <Input
              id="instruments"
              value={instruments}
              onChange={(e) => setInstruments(e.target.value)}
              placeholder="piano, guitar, drums"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="bpm" className="block text-sm">
              BPM（每分钟拍数）
            </label>
            <Input
              id="bpm"
              type="number"
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
              placeholder="120"
            />
          </div>
        </div>
      </div>

      {/* 提交按钮 */}
      <div className="flex justify-between items-center gap-4">
        <Button type="submit" disabled={isSubmitting || !hasRequiredContent}>
          {isSubmitting ? '提交中...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
