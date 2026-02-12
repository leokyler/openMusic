/**
 * 用户友好的错误消息
 * 将技术错误转换为用户可理解的语言 (SC-005: 90%用户无需文档理解)
 */

/**
 * 错误消息映射
 */
export const FRIENDLY_ERROR_MESSAGES: Record<string, string> = {
  // 验证错误 - 更清晰的语言
  VALIDATION_ERROR: '请检查填写的内容，确保至少填写歌词或风格',
  'lyrics required': '歌词和风格至少需要填写一个，不能都留空',
  'style required': '请填写风格描述（如：流行、摇滚）或歌词',
  'lyrics too long': '歌词超过3500字符了，请精简一些内容',
  'style too long': '风格描述超过2000字符了，建议用关键词代替（如：Pop, 120 BPM）',
  'invalid url': '请输入有效的网址链接（如：https://example.com/audio.mp3）',
  'invalid json': '格式有误，请检查引号和括号是否配对',

  // 数据库错误 - 更友好的提示
  DUPLICATE_RECORD: '这个提示词已存在，无需重复创建',
  NOT_FOUND: '抱歉，找不到这个提示词，可能已被删除',
  FOREIGN_KEY_CONSTRAINT: '关联的提示词不存在，请先检查提示词ID',
  RECORD_LOCKED: '该提示词正在被处理，请稍后再试',

  // 网络错误 - 具体的操作指引
  NETWORK_ERROR: '网络连接失败，请检查网络后点击"重试"按钮',
  TIMEOUT: '响应时间过长，请稍后重试或减少数据量',
  SERVER_ERROR: '服务暂时不可用，请稍后重试',
  UNAUTHORIZED: '操作需要权限，请刷新页面后重试',

  // 通用错误 - 明确的下一步
  BAD_REQUEST: '提交的数据有误，请检查输入内容',
  INTERNAL_ERROR: '系统遇到问题，我们正在修复，请稍后重试',
  UNKNOWN_ERROR: '遇到未知问题，请重试或联系技术支持',
};

/**
 * 错误消息解释 - 帮助用户理解为什么
 */
export const ERROR_EXPLANATIONS: Record<string, string> = {
  'section tags': '章节标签如 [Verse]、[Chorus] 帮助 AI 理解歌曲结构，提高生成质量',
  'vocal params': '人声参数定义了歌手的声音特征（如性别、音色），让音乐更符合预期',
  'instrumental params': '器乐配置定义了背景音乐的乐器和节奏，营造更好的音乐氛围',
  'quality score': '质量评分反映提示词的完整度，高分说明信息更充分，但不保证生成结果一定完美',
  'lyrics required': 'AI 至少需要一些创作方向（歌词或风格）来生成音乐',
  'style required': '风格描述告诉 AI 音乐类型（如流行、摇滚），帮助生成符合预期的作品',
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
  const techTerms: Record<string, string> = {
    Prisma: '数据库',
    'Foreign key constraint': '关联的提示词不存在',
    'Unique constraint': '内容重复',
    'Null constraint': '必填项缺失',
    'Invalid UUID': 'ID 格式错误',
    'Connection timeout': '连接超时',
    'Database error': '数据保存失败',
  };

  for (const [tech, friendly] of Object.entries(techTerms)) {
    message = message.replace(new RegExp(tech, 'gi'), friendly);
  }

  return message;
}

/**
 * 获取错误解释
 */
export function getErrorExplanation(errorCode: string): string | undefined {
  return ERROR_EXPLANATIONS[errorCode];
}

/**
 * 为验证错误添加可操作的建议
 */
export function getErrorSuggestion(errorCode: string): string | undefined {
  const suggestions: Record<string, string> = {
    'lyrics too long': '💡 建议：删除重复段落，或拆分成多个提示词',
    'style too long': '💡 建议：用关键词如 "Pop, Acoustic, 120 BPM" 代替长句',
    'missing vocals': '💡 建议：至少填写人声音色（如"女声"）或演唱风格',
    'missing instruments': '💡 建议：至少填写一种乐器（如"钢琴"）或节奏速度',
    'lyrics required': '💡 建议：即使只有几句歌词也能开始创作',
    'style required': '💡 建议：填写音乐类型（如：流行、摇滚、古典）',
    'invalid url': '💡 建议：复制网址时确保包含 https:// 开头',
    'invalid json': '💡 建议：检查是否漏掉逗号、引号或括号',
    NETWORK_ERROR: '💡 建议：检查 WiFi 连接，或切换到移动网络',
    TIMEOUT: '💡 建议：稍后重试，或减少歌词长度',
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

  /** 可操作的按钮文本（可选） */
  actionLabel?: string;

  /** 错误类型（用于样式区分） */
  type?: 'error' | 'warning' | 'info';
}

/**
 * 格式化错误供前端显示
 */
export function formatErrorForDisplay(errorCode: string, originalMessage?: string): FormattedError {
  const message = getFriendlyErrorMessage(errorCode, originalMessage);
  const explanation = getErrorExplanation(errorCode);
  const suggestion = getErrorSuggestion(errorCode);

  const actionLabels: Record<string, string> = {
    NETWORK_ERROR: '重试',
    TIMEOUT: '重新加载',
    NOT_FOUND: '返回列表',
    UNAUTHORIZED: '刷新页面',
  };

  const errorTypes: Record<string, 'error' | 'warning' | 'info'> = {
    'lyrics too long': 'warning',
    'style too long': 'warning',
    NETWORK_ERROR: 'warning',
    TIMEOUT: 'warning',
    VALIDATION_ERROR: 'info',
  };

  return {
    message,
    type: errorTypes[errorCode] || 'error',
    ...(explanation && { explanation }),
    ...(suggestion && { suggestion }),
    ...(actionLabels[errorCode] && { actionLabel: actionLabels[errorCode] }),
  };
}
