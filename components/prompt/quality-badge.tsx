/**
 * QualityBadge 组件
 * 显示提示词质量评分徽章
 */
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface QualityBadgeProps {
  /** 质量评分 */
  score: 'high' | 'medium' | 'low';
  /** 自定义类名 */
  className?: string;
}

/**
 * 质量评分配置
 */
const QUALITY_CONFIG = {
  high: {
    label: '高质量',
    variant: 'default' as const,
    className: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200',
  },
  medium: {
    label: '中等质量',
    variant: 'secondary' as const,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200',
  },
  low: {
    label: '低质量',
    variant: 'outline' as const,
    className: 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100',
  },
};

export function QualityBadge({ score, className }: QualityBadgeProps) {
  const config = QUALITY_CONFIG[score];

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
