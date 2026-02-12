/**
 * 用户友好的错误消息
 * 将技术错误转换为用户可理解的语言
 */

/**
 * 错误消息映射
 */
export const FRIENDLY_ERROR_MESSAGES: Record<string, string> = {
  // 验证错误
  VALIDATION_ERROR: '输入的数据格式不正确，请检查后重试',
  'lyrics required': '请填写歌词或风格描述',
  'style required': '请填写风格描述或歌词',
  'lyrics too long': '歌词太长了，请缩短到3500字符以内',
  'style too long': '风格描述太长了，请缩短到2000字符以内',

  // 数据库错误
  DUPLICATE_RECORD: '这个提示词已经存在了',
  NOT_FOUND: '找不到这个提示词',
  FOREIGN_KEY_CONSTRAINT: '关联的数据不存在',

  // 网络错误
  NETWORK_ERROR: '网络连接失败，请检查网络后重试',
  TIMEOUT: '请求超时，请稍后重试',

  // 通用错误
  BAD_REQUEST: '请求数据有误，请检查输入',
  INTERNAL_ERROR: '服务器出错了，我们正在修复中，请稍后重试',
};

/**
 * 错误消息解释
 */
export const ERROR_EXPLANATIONS: Record<string, string> = {
  'section tags': '章节标签如 [Verse]、[Chorus] 帮助 AI 理解歌曲结构',
  'vocal params': '人声参数定义了歌手的声音特征',
  'instrumental params': '器乐配置定义了背景音乐的风格',
  'quality score': '质量评分反映了提示词的完整度，高分不代表生成结果一定好',
};

/**
 * 获取用户友好的错误消息
 */
export function getFriendlyErrorMessage(errorCode: string, originalMessage?: string): string {
  // 优先使用预定义的友好消息
  if (FRIENDLY_ERROR_MESSAGES[errorCode]) {
    return FRIENDLY_ERROR_MESSAGES[errorCode];
  }

  // 将技术错误转换为友好语言
  let message = originalMessage || errorCode;

  // 转换常见的技术术语
  message = message
    .replace('Prisma', '数据库')
    .replace('Foreign key constraint', '关联数据')
    .replace('Unique constraint', '重复数据')
    .replace('Null constraint', '缺少必填项');

  return message;
}

/**
 * 获取错误解释
 */
export function getErrorExplanation(errorCode: string): string | undefined {
  return ERROR_EXPLANATIONS[errorCode];
}

/**
 * 为验证错误添加建议
 */
export function getErrorSuggestion(errorCode: string): string | undefined {
  const suggestions: Record<string, string> = {
    'lyrics too long': '尝试删除重复的段落或简化描述',
    'style too long': '使用关键词如 "Pop"、"Acoustic" 代替长句',
    'missing vocals': '至少填写人声的音色或风格',
    'missing instruments': '至少填写一种乐器或BPM',
  };

  return suggestions[errorCode];
}

/**
 * 格式化完整错误响应
 */
export interface FormattedError {
  /** 用户友好的错误消息 */
  message: string;

  /** 错误解释（可选） */
  explanation?: string;

  /** 改进建议（可选） */
  suggestion?: string;
}

/**
 * 格式化错误供前端显示
 */
export function formatErrorForDisplay(errorCode: string, originalMessage?: string): FormattedError {
  const message = getFriendlyErrorMessage(errorCode, originalMessage);
  const explanation = getErrorExplanation(errorCode);
  const suggestion = getErrorSuggestion(errorCode);

  return {
    message,
    ...(explanation && { explanation }),
    ...(suggestion && { suggestion }),
  };
}
