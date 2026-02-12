/**
 * ValidationAlert 组件
 * 显示验证警告列表
 */
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ValidationAlertProps {
  /** 警告列表 */
  warnings: string[];
  /** 是否严重（红色警告） */
  severe?: boolean;
  /** 自定义类名 */
  className?: string;
}

export function ValidationAlert({ warnings, severe = false, className }: ValidationAlertProps) {
  // 没有警告时不显示
  if (warnings.length === 0) {
    return null;
  }

  const alertColor = severe
    ? 'border-red-500 bg-red-50 text-red-900'
    : 'border-yellow-500 bg-yellow-50 text-yellow-900';

  return (
    <Alert className={cn(alertColor, className)}>
      <AlertDescription>
        <div className="space-y-1">
          <p className="font-medium">{severe ? '请注意以下问题：' : '建议改进以下方面：'}</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            {warnings.map((warning, index) => (
              <li key={index} className="text-sm">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
}
