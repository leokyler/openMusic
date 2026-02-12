# Data Model Design

**Feature**: Structured Prompt Builder MVP  
**Date**: 2026-02-11  
**Purpose**: 定义数据库 schema、TypeScript 类型和实体关系

## Database Schema

### ER Diagram

```
┌─────────────────────────┐
│       Prompt            │
├─────────────────────────┤
│ id: UUID (PK)           │
│ version: VARCHAR(20)    │
│ lyrics: TEXT NULL       │
│ style: TEXT NULL        │
│ vocal: JSONB NULL       │
│ instrumental: JSONB NULL│
│ quality_score: ENUM     │
│ quality_warnings: JSONB │
│ created_at: TIMESTAMP   │
│ updated_at: TIMESTAMP   │
└───────────┬─────────────┘
            │ 1
            │
            │ has many
            │
            │ N
┌───────────▼─────────────┐
│       Output            │
├─────────────────────────┤
│ id: UUID (PK)           │
│ prompt_id: UUID (FK)    │
│ audio_url: VARCHAR(500) │
│ model_version: VARCHAR  │
│ generation_params: JSONB│
│ created_at: TIMESTAMP   │
└─────────────────────────┘
```

### Relationships

- **Prompt → Output**: 1:N (一个提示词可以生成多个输出)
- **Output → Prompt**: N:1 (每个输出关联一个提示词)

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Prompt {
  id                String         @id @default(uuid())
  version           String         @default("1.0.0")

  // 四个主要组件
  lyrics            String?        @db.Text
  style             String?        @db.Text
  vocal             Json?          // VocalParams 的 JSON
  instrumental      Json?          // InstrumentalParams 的 JSON

  // 质量元数据
  qualityScore      QualityScore   @map("quality_score")
  qualityWarnings   Json           @default("[]") @map("quality_warnings")

  // 关联
  outputs           Output[]

  // 审计字段
  createdAt         DateTime       @default(now()) @map("created_at")
  updatedAt         DateTime       @updatedAt @map("updated_at")

  @@index([createdAt(sort: Desc)])
  @@index([qualityScore])
  @@map("prompts")
}

model Output {
  id                String         @id @default(uuid())
  promptId          String         @map("prompt_id")

  audioUrl          String         @map("audio_url") @db.VarChar(500)
  modelVersion      String         @map("model_version") @default("Music-2.5") @db.VarChar(50)
  generationParams  Json           @default("{}") @map("generation_params")

  // 关联
  prompt            Prompt         @relation(fields: [promptId], references: [id], onDelete: Cascade)

  createdAt         DateTime       @default(now()) @map("created_at")

  @@index([promptId])
  @@index([createdAt(sort: Desc)])
  @@map("outputs")
}

enum QualityScore {
  high
  medium
  low
}
```

## TypeScript Types

### Domain Types

```typescript
// lib/types/prompt.ts

/**
 * 人声参数配置
 */
export interface VocalParams {
  /** 性别：男声、女声或其他 */
  gender?: 'male' | 'female' | 'other';

  /** 音色描述（如：温暖、清澈、沙哑） */
  timbre?: string;

  /** 演唱风格（如：抒情、高亢、说唱） */
  style?: string;

  /** 音频效果 */
  effects?: {
    /** 混响类型（如：hall, room, plate） */
    reverb?: string;

    /** 是否启用自动调音 */
    autoTune?: boolean;

    /** 其他效果参数 */
    [key: string]: any;
  };

  /** 扩展字段 */
  [key: string]: any;
}

/**
 * 器乐配置参数
 */
export interface InstrumentalParams {
  /** 乐器列表（如：piano, guitar, drums） */
  instruments?: string[];

  /** BPM（每分钟拍数） */
  bpm?: number;

  /** 制作参数（如：acoustic, electric, orchestral） */
  production?: string;

  /** 扩展字段 */
  [key: string]: any;
}

/**
 * 生成参数
 */
export interface GenerationParams {
  /** 随机种子（可复现生成） */
  seed?: number;

  /** 温度参数（创造性控制） */
  temperature?: number;

  /** 扩展字段 */
  [key: string]: any;
}

/**
 * 质量评分枚举
 */
export type QualityScore = 'high' | 'medium' | 'low';

/**
 * 提示词实体
 */
export interface Prompt {
  /** UUID */
  id: string;

  /** 语义化版本号 */
  version: string;

  /** 歌词（支持章节标签） */
  lyrics: string | null;

  /** 风格描述 */
  style: string | null;

  /** 人声参数 */
  vocal: VocalParams | null;

  /** 器乐配置 */
  instrumental: InstrumentalParams | null;

  /** 质量评分 */
  qualityScore: QualityScore;

  /** 质量警告列表 */
  qualityWarnings: string[];

  /** 关联的输出列表 */
  outputs?: Output[];

  /** 创建时间 */
  createdAt: Date;

  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 输出实体
 */
export interface Output {
  /** UUID */
  id: string;

  /** 关联的提示词 ID */
  promptId: string;

  /** 音频 URL */
  audioUrl: string;

  /** 模型版本 */
  modelVersion: string;

  /** 生成参数 */
  generationParams: GenerationParams;

  /** 关联的提示词（懒加载） */
  prompt?: Prompt;

  /** 创建时间 */
  createdAt: Date;
}

/**
 * 创建提示词的 DTO
 */
export interface CreatePromptDto {
  lyrics?: string | null;
  style?: string | null;
  vocal?: VocalParams | null;
  instrumental?: InstrumentalParams | null;
}

/**
 * 创建输出的 DTO
 */
export interface CreateOutputDto {
  promptId: string;
  audioUrl: string;
  modelVersion?: string;
  generationParams?: GenerationParams;
}

/**
 * 列表查询选项
 */
export interface PromptListOptions {
  /** 页码（从 1 开始） */
  page?: number;

  /** 每页数量 */
  pageSize?: number;

  /** 质量过滤 */
  qualityScore?: QualityScore;

  /** 排序字段 */
  sortBy?: 'createdAt' | 'updatedAt';

  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  /** 数据列表 */
  items: T[];

  /** 当前页码 */
  page: number;

  /** 每页数量 */
  pageSize: number;

  /** 总记录数 */
  total: number;

  /** 总页数 */
  totalPages: number;
}
```

## Validation Rules

### Prompt Validation

基于 JSON Schema（参考 `lib/schemas/prompt.schema.json`）：

```typescript
// lib/schemas/prompt.schema.ts

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
```

### Output Validation

```typescript
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
```

## State Transitions

### Prompt Lifecycle

```
[不存在] ──create──> [已创建 (quality_score 计算完成)]
                               │
                               │ (可选)
                               ▼
                        [已关联输出]
```

MVP 阶段不支持更新和删除，状态转换简单。

### Output Lifecycle

```
[不存在] ──associate──> [已关联]
```

Output 创建后只读，不可修改。

## Database Indexes

```sql
-- 提示词表索引
CREATE INDEX idx_prompts_created_at ON prompts (created_at DESC);
CREATE INDEX idx_prompts_quality_score ON prompts (quality_score);

-- 输出表索引
CREATE INDEX idx_outputs_prompt_id ON outputs (prompt_id);
CREATE INDEX idx_outputs_created_at ON outputs (created_at DESC);
```

**索引策略**:

- `created_at DESC`: 支持列表按时间倒序查询
- `quality_score`: 支持按质量过滤
- `prompt_id`: 外键索引，加速关联查询

## Data Constraints

### Database Level

```sql
-- 提示词约束
ALTER TABLE prompts
  ADD CONSTRAINT check_lyrics_or_style
  CHECK (lyrics IS NOT NULL OR style IS NOT NULL);

ALTER TABLE prompts
  ADD CONSTRAINT check_version_format
  CHECK (version ~ '^\d+\.\d+\.\d+$'); -- Semantic versioning

-- 输出约束
ALTER TABLE outputs
  ADD CONSTRAINT fk_outputs_prompt_id
  FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE;
```

### Application Level

- **Lyrics 长度**: 前端警告 > 3500 字符
- **Style 长度**: 前端警告 > 2000 字符
- **BPM 范围**: 40-240（合理音乐速度）
- **URL 格式**: 验证 audio_url 为有效 URL

## Migration Strategy

### Initial Migration

```bash
# 创建初始 migration
npx prisma migrate dev --name init

# 生成 Prisma Client
npx prisma generate
```

### Seed Data (Optional)

```typescript
// prisma/seed.ts

import { PrismaClient, QualityScore } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 创建示例提示词
  const examplePrompt = await prisma.prompt.create({
    data: {
      version: '1.0.0',
      lyrics:
        '[Verse 1]\n在夜空下徘徊\n寻找失去的光彩\n\n[Chorus]\n星光闪耀，照亮前方\n勇敢前行，不再迷茫',
      style: 'Pop, Acoustic, Emotional, 80-100 BPM',
      vocal: {
        gender: 'female',
        timbre: '清澈、温暖',
        style: '抒情',
      },
      instrumental: {
        instruments: ['acoustic guitar', 'piano', 'light percussion'],
        bpm: 90,
      },
      qualityScore: 'high' as QualityScore,
      qualityWarnings: [],
    },
  });

  console.log('Created example prompt:', examplePrompt.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Type Mapping

| Prisma Type | PostgreSQL Type  | TypeScript Type | JSON Schema Type |
| ----------- | ---------------- | --------------- | ---------------- |
| String      | VARCHAR/TEXT     | string          | string           |
| Int         | INTEGER          | number          | integer          |
| Float       | DOUBLE PRECISION | number          | number           |
| Boolean     | BOOLEAN          | boolean         | boolean          |
| DateTime    | TIMESTAMP        | Date            | string (ISO)     |
| Json        | JSONB            | any/T           | object/array     |
| Enum        | ENUM             | union type      | enum             |

## Repository Pattern (Optional)

为了解耦业务逻辑和数据访问，可以使用 Repository 模式：

```typescript
// lib/repositories/prompt.repository.ts

export class PromptRepository {
  async create(
    data: CreatePromptDto,
    qualityScore: QualityScore,
    warnings: string[]
  ): Promise<Prompt> {
    return prisma.prompt.create({
      data: {
        ...data,
        qualityScore,
        qualityWarnings: warnings,
      },
    });
  }

  async findById(id: string): Promise<Prompt | null> {
    return prisma.prompt.findUnique({
      where: { id },
      include: { outputs: true },
    });
  }

  async findAll(options: PromptListOptions): Promise<PaginatedResult<Prompt>> {
    const {
      page = 1,
      pageSize = 20,
      qualityScore,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const where = qualityScore ? { qualityScore } : {};

    const [items, total] = await Promise.all([
      prisma.prompt.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { _count: { select: { outputs: true } } },
      }),
      prisma.prompt.count({ where }),
    ]);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
```

## Next Steps

Phase 1 继续：

1. ✅ data-model.md 完成
2. 📝 创建 API 合约规范（`contracts/prompts.openapi.yaml`）
3. 📝 创建快速启动指南（`quickstart.md`）
4. 🔄 更新代理上下文
