# Data Model: Prompt Paste Button

**Feature**: 002-prompt-paste-button
**Date**: 2026-02-12
**Phase**: Phase 1 - Design & Contracts

## Overview

本文档定义提示词粘贴按钮功能的数据模型扩展。本功能主要是在现有 Prompt 实体基础上添加使用追踪字段，不引入新的独立实体。

---

## Entity Extensions

### Prompt

扩展现有 Prompt 模型，添加复制追踪字段。

**Schema Location**: `prisma/schema.prisma`

```prisma
model Prompt {
  id            String    @id @default(cuid())
  // ... existing fields from feature 001 ...
  version       String    @default("1.0.0")
  quality_score  String    @default("low") // "high" | "medium" | "low"

  // New fields for copy tracking (feature 002)
  copy_count     Int       @default(0)           // 总复制次数
  last_copied_at DateTime?                     // 最后复制时间（可为 null）

  created_at     DateTime   @default(now())
  updated_at     DateTime   @updatedAt

  // Relations (existing)
  outputs       Output[]
}
```

**Field Definitions**:

| Field            | Type     | Nullable | Default | Description                                              |
| ---------------- | -------- | -------- | ------- | -------------------------------------------------------- |
| `copy_count`     | Int      | No       | 0       | 该提示词被复制的总次数，每次复制成功后原子性递增         |
| `last_copied_at` | DateTime | Yes      | null    | 最后一次复制的时间戳（ISO 8601 格式），首次复制前为 null |

**Validation Rules**:

1. **copy_count**
   - 必须非负整数（≥0）
   - 初始值为 0
   - 每次复制成功后原子性递增（使用 Prisma `increment`）

2. **last_copied_at**
   - 可为 null（未复制过）
   - 复制成功后设置为当前 UTC 时间
   - 精度到毫秒（用于排序和分析）

**Constraints**:

- 匿名追踪：不关联用户 ID、session ID 或 IP 地址
- 并发安全：使用数据库原子操作，防止 race condition
- 软删除友好：删除提示词后追踪数据随提示词一起删除

---

## TypeScript Types

**Type Location**: `src/types/prompt.ts`

```typescript
// Extended Prompt type with copy tracking
export interface Prompt {
  id: string;
  lyrics: string | null;
  style: string | null;
  vocal: string | null;
  instrumental: string | null;
  version: string;
  quality_score: 'high' | 'medium' | 'low';
  copy_count: number; // NEW: 总复制次数
  last_copied_at: string | null; // NEW: 最后复制时间（ISO 8601）
  created_at: string;
  updated_at: string;
}

// Copy tracking response (API)
export interface CopyTrackingResponse {
  success: boolean;
  copy_count: number;
  last_copied_at: string;
}

// Formatted prompt for clipboard
export interface FormattedPrompt {
  text: string; // 完整格式化文本
  field_count: number; // 包含的字段数量（1-4）
  fields: string[]; // 包含的字段名称列表
}
```

---

## State Transitions

### Copy Count State Machine

```
┌─────────────┐
│   Initial   │ copy_count = 0, last_copied_at = null
└──────┬──────┘
       │
       │ User clicks copy button (first time)
       ▼
┌─────────────┐
│   Copied    │ copy_count = 1, last_copied_at = NOW
└──────┬──────┘
       │
       │ User clicks copy button (subsequent times)
       ▼
┌──────────────────────────┐
│   Copied (n+1 times)   │ copy_count = n+1, last_copied_at = NOW
└──────────────────────────┘
```

**States**:

1. **Initial**: 新创建的提示词，`copy_count = 0`, `last_copied_at = null`
2. **Copied**: 至少被复制过一次，`copy_count ≥ 1`, `last_copied_at = timestamp`

**Transitions**:

- **Initial → Copied**: 用户点击复制按钮，API 调用成功后触发
- **Copied → Copied**: 用户再次点击复制按钮，`copy_count` 递增，`last_copied_at` 更新

**No Rollback**: 复制计数只增不减，无法撤销

---

## Data Access Patterns

### Reading Copy Metrics

**Use Case**: 显示提示词的复制次数和最后复制时间

**Query Example**:

```typescript
// 获取提示词详情（包含追踪数据）
const prompt = await prisma.prompt.findUnique({
  where: { id: promptId },
  select: {
    id: true,
    lyrics: true,
    style: true,
    copy_count: true, // NEW
    last_copied_at: true, // NEW
  },
});
```

**Response**:

```json
{
  "id": "clx123abc",
  "lyrics": "[Verse]\n...",
  "style": "Pop style",
  "copy_count": 5,
  "last_copied_at": "2026-02-12T10:30:45.123Z"
}
```

### Updating Copy Metrics

**Use Case**: 用户点击复制按钮后，异步更新追踪数据

**Mutation Example**:

```typescript
// 原子性更新（并发安全）
const updated = await prisma.prompt.update({
  where: { id: promptId },
  data: {
    copy_count: { increment: 1 }, // Prisma 原子操作
    last_copied_at: new Date(), // 设置当前时间
  },
  select: {
    copy_count: true,
    last_copied_at: true,
  },
});
```

**Concurrency Handling**:

- Prisma 的 `increment` 是数据库级别的原子操作
- 多个用户同时复制同一提示词时，计数器不会丢失更新
- 示例：初始 `copy_count = 5`，两个并发请求 → 最终 `copy_count = 7`（不是 6）

### Sorting by Popularity

**Use Case**: 按复制次数排序显示"最常复制的提示词"

**Query Example**:

```typescript
// 获取最常复制的提示词（Top 10）
const popularPrompts = await prisma.prompt.findMany({
  orderBy: {
    copy_count: 'desc', // 按复制次数降序
  },
  take: 10,
  select: {
    id: true,
    lyrics: true,
    style: true,
    copy_count: true,
    last_copied_at: true,
  },
});
```

---

## Privacy & Security

### Anonymity Guarantee

**No User Identification**:

- 不记录用户 ID、session ID、IP 地址
- 不记录用户代理（User-Agent）、设备信息
- 无法通过 `copy_count` 或 `last_copied_at` 反向追踪用户

**Data Minimization**:

- 只记录必要的统计信息（计数 + 时间戳）
- 不存储复制的内容（已存在于 Prompt 中）

### GDPR Compliance

**Lawful Basis**:

- 合法利益：改进产品功能和用户体验
- 无需用户同意（匿名数据，不识别个人身份）

**Data Subject Rights**:

- **访问权**：用户可查看自己创建的提示词的 `copy_count`（通过详情页）
- **删除权**：删除提示词时，追踪数据随之删除
- **可移植权**：不适用（无法导出匿名计数数据）

---

## Migration Strategy

### Prisma Migration

**File**: `prisma/migrations/20260212_add_copy_tracking/migration.sql`

```sql
-- Add copy tracking fields to Prompt table
ALTER TABLE "Prompt"
ADD COLUMN "copy_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "last_copied_at" TIMESTAMP(3);

-- Create index for sorting by popularity
CREATE INDEX "Prompt_copy_count_idx" ON "Prompt"("copy_count" DESC);
```

**Rollback**:

```sql
-- Drop index
DROP INDEX IF EXISTS "Prompt_copy_count_idx";

-- Remove columns
ALTER TABLE "Prompt"
DROP COLUMN IF EXISTS "copy_count",
DROP COLUMN IF EXISTS "last_copied_at";
```

**Impact Analysis**:

- ✅ 向后兼容：现有 Prompt 记录自动初始化 `copy_count = 0`, `last_copied_at = null`
- ✅ 无停机：在线迁移，无需锁定表
- ✅ 性能影响： negligible（整数列 + 索引优化排序）

---

## Testing Strategy

### Unit Tests

**File**: `tests/unit/models/prompt-copy.test.ts`

```typescript
describe('Prompt Copy Tracking', () => {
  it('should initialize with copy_count = 0', async () => {
    const prompt = await createPrompt();
    expect(prompt.copy_count).toBe(0);
    expect(prompt.last_copied_at).toBeNull();
  });

  it('should increment copy_count atomically', async () => {
    const prompt = await createPrompt();

    // 并发复制
    await Promise.all([trackCopy(prompt.id), trackCopy(prompt.id), trackCopy(prompt.id)]);

    const updated = await getPrompt(prompt.id);
    expect(updated.copy_count).toBe(3);
  });

  it('should update last_copied_at on each copy', async () => {
    const prompt = await createPrompt();

    await trackCopy(prompt.id);
    const firstCopy = await getPrompt(prompt.id);
    expect(firstCopy.last_copied_at).not.toBeNull();

    // 等待 1ms 后再次复制
    await delay(1);
    await trackCopy(prompt.id);
    const secondCopy = await getPrompt(prompt.id);

    expect(secondCopy.last_copied_at).not.toEqual(firstCopy.last_copied_at);
  });
});
```

### Integration Tests

**File**: `tests/integration/copy-api.test.ts`

```typescript
describe('POST /api/prompts/:id/copy', () => {
  it('should return 200 and updated metrics', async () => {
    const prompt = await createPrompt();

    const response = await fetch(`/api/prompts/${prompt.id}/copy`, {
      method: 'POST',
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.copy_count).toBe(1);
    expect(data.last_copied_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('should return 404 for non-existent prompt', async () => {
    const response = await fetch('/api/prompts/invalid/copy', {
      method: 'POST',
    });

    expect(response.status).toBe(404);
  });
});
```

---

## Summary

本功能的数据模型扩展非常简单：

- ✅ 只添加 2 个字段到现有 Prompt 实体
- ✅ 向后兼容，无破坏性变更
- ✅ 并发安全（Prisma 原子操作）
- ✅ 隐私友好（完全匿名追踪）
- ✅ 易于迁移（在线 SQL 迁移）

下一步：生成 API 合约规范（`contracts/prompt-copy.openapi.yaml`）。
