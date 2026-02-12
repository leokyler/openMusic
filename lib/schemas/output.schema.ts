/**
 * Output JSON Schema 定义
 * 用于验证输出关联的结构和数据
 */
export const outputSchema = {
  type: 'object',
  required: ['promptId', 'audioUrl'],
  properties: {
    promptId: {
      type: 'string',
      format: 'uuid',
      description: '关联的提示词 ID',
    },
    audioUrl: {
      type: 'string',
      format: 'uri',
      maxLength: 500,
      description: '音频文件 URL',
    },
    modelVersion: {
      type: 'string',
      default: 'Music-2.5',
      description: 'Minimax 模型版本',
    },
    generationParams: {
      type: 'object',
      properties: {
        seed: { type: 'number' },
        temperature: {
          type: 'number',
          minimum: 0,
          maximum: 2,
        },
      },
      additionalProperties: true,
    },
  },
} as const;

/**
 * CreateOutputDto JSON Schema
 * 用于验证创建输出关联请求的数据
 */
export const createOutputDtoSchema = {
  type: 'object',
  required: ['audioUrl'],
  properties: {
    audioUrl: {
      type: 'string',
      format: 'uri',
      maxLength: 500,
    },
    modelVersion: {
      type: 'string',
      default: 'Music-2.5',
    },
    generationParams: {
      type: 'object',
      additionalProperties: true,
    },
  },
} as const;
