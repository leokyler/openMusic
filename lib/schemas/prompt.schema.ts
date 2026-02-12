/**
 * Prompt JSON Schema 定义
 * 用于验证提示词的结构和数据
 */
export const promptSchema = {
  type: 'object',
  properties: {
    lyrics: {
      type: ['string', 'null'],
      maxLength: 3500,
      description: '歌词内容，支持章节标签如 [Verse]、[Chorus]',
    },
    style: {
      type: ['string', 'null'],
      maxLength: 2000,
      description: '风格描述，如：pop, rock, electronic',
    },
    vocal: {
      type: ['object', 'null'],
      properties: {
        gender: {
          type: 'string',
          enum: ['male', 'female', 'other'],
        },
        timbre: { type: 'string' },
        style: { type: 'string' },
        effects: {
          type: 'object',
          properties: {
            reverb: { type: 'string' },
            autoTune: { type: 'boolean' },
          },
          additionalProperties: true,
        },
      },
      additionalProperties: true,
    },
    instrumental: {
      type: ['object', 'null'],
      properties: {
        instruments: {
          type: 'array',
          items: { type: 'string' },
        },
        bpm: {
          type: 'number',
          minimum: 40,
          maximum: 240,
        },
        production: { type: 'string' },
      },
      additionalProperties: true,
    },
  },
  // 至少需要 lyrics 或 style 其中之一
  anyOf: [{ required: ['lyrics'] }, { required: ['style'] }],
} as const;

/**
 * CreatePromptDto JSON Schema
 * 用于验证创建提示词请求的数据
 */
export const createPromptDtoSchema = {
  type: 'object',
  properties: {
    lyrics: {
      type: ['string', 'null'],
      maxLength: 3500,
    },
    style: {
      type: ['string', 'null'],
      maxLength: 2000,
    },
    vocal: {
      type: ['object', 'null'],
      additionalProperties: true,
    },
    instrumental: {
      type: ['object', 'null'],
      additionalProperties: true,
    },
  },
  anyOf: [{ required: ['lyrics'] }, { required: ['style'] }],
} as const;
