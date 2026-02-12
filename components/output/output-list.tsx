/**
 * OutputList 组件
 * 显示输出列表
 */
import type { Output } from '@/lib/types/output';

interface OutputListProps {
  /** 输出列表 */
  outputs: Output[];
}

/**
 * 格式化日期
 */
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OutputList({ outputs }: OutputListProps) {
  // 空状态
  if (outputs.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <div className="text-4xl mb-2">🎵</div>
        <p className="text-gray-600">还没有关联的音频输出</p>
        <p className="text-sm text-gray-500 mt-1">
          使用 Minimax 生成音乐后，可以在这里关联音频文件
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {outputs.map((output) => (
        <div
          key={output.id}
          className="bg-white p-4 rounded-lg border hover:shadow-sm transition-shadow"
        >
          {/* 头部信息 */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900">音频输出</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                  {output.modelVersion}
                </span>
              </div>
              <time className="text-xs text-gray-500">{formatDate(output.createdAt)}</time>
            </div>
          </div>

          {/* 音频URL */}
          <div className="mb-3">
            <a
              href={output.audioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm break-all"
            >
              🔗 {output.audioUrl}
            </a>
          </div>

          {/* 生成参数 */}
          {output.generationParams && Object.keys(output.generationParams).length > 0 && (
            <div className="bg-gray-50 p-3 rounded text-xs">
              <p className="font-medium text-gray-700 mb-1">生成参数</p>
              <pre className="text-gray-600 overflow-x-auto">
                {JSON.stringify(output.generationParams, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
