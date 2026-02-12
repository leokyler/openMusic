/**
 * Schema 验证工具
 * 使用 Ajv 进行 JSON Schema 验证
 */
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { promptSchema, createPromptDtoSchema } from './prompt.schema';
import { outputSchema, createOutputDtoSchema } from './output.schema';

// 创建 Ajv 实例并添加格式支持
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

/**
 * 验证结果类型
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean;

  /** 错误列表 */
  errors: Array<{
    /** 字段路径 */
    path: string;

    /** 错误消息 */
    message: string;

    /** 错误参数 */
    params?: any;
  }>;
}

/**
 * 验证 CreatePromptDto
 */
export const validateCreatePromptDto = ajv.compile(createPromptDtoSchema);

/**
 * 验证 Prompt 完整数据
 */
export const validatePrompt = ajv.compile(promptSchema);

/**
 * 验证 CreateOutputDto
 */
export const validateCreateOutputDto = ajv.compile(createOutputDtoSchema);

/**
 * 验证 Output 完整数据
 */
export const validateOutput = ajv.compile(outputSchema);

/**
 * 格式化 Ajv 错误信息
 */
function formatErrors(errors: Array<{ instancePath: string; message: string; params?: any }>) {
  return errors.map((error) => ({
    path: error.instancePath || 'root',
    message: error.message,
    params: error.params,
  }));
}

/**
 * 验证数据并返回格式化结果
 */
export function validateData<T>(schema: any, data: T): ValidationResult {
  const valid = schema(data);

  if (valid) {
    return { valid: true, errors: [] };
  }

  const errors = formatErrors(schema.errors || []);
  return { valid: false, errors };
}

/**
 * 验证提示词创建请求
 */
export function validatePromptCreateRequest(data: unknown): ValidationResult {
  return validateData(validateCreatePromptDto, data);
}

/**
 * 验证输出创建请求
 */
export function validateOutputCreateRequest(data: unknown): ValidationResult {
  return validateData(validateCreateOutputDto, data);
}
