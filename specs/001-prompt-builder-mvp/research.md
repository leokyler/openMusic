# Phase 0: Research & Technical Decisions

**Feature**: Structured Prompt Builder MVP  
**Date**: 2026-02-11  
**Purpose**: 解决技术选型问题，验证架构可行性

## Research Questions Resolved

### 1. 数据库选型：PostgreSQL vs SQLite vs MongoDB

**Decision**: PostgreSQL

**Rationale**:

- **结构化数据**: Prompt 和 Output 实体有明确的 schema，关系型数据库更适合
- **关联查询**: 需要高效的双向关联查询（Prompt ↔ Outputs）
- **JSON 支持**: PostgreSQL 的 JSONB 类型可以存储 vocal、instrumental 等灵活字段
- **扩展性**: 支持未来添加用户表、权限系统
- **事务支持**: 保证关联记录的一致性

**Alternatives Considered**:

- **SQLite**: 简单但不适合生产环境，并发性能差
- **MongoDB**: JSON 原生但关联查询复杂，不适合强关系数据

### 2. 验证策略：严格 vs 宽松

**Decision**: 宽松验证 + 质量评分

**Rationale**:

- **用户体验**: 即使不遵循完整结构也能生成音乐（Minimax 特性）
- **学习曲线**: 降低入门门槛，通过警告引导最佳实践
- **灵活性**: 支持实验性提示词，不强制标准化
- **质量反馈**: 通过评分让用户理解结构的重要性

**Alternatives Considered**:

- **严格验证**: 会阻止用户快速实验，违背 AI 工具的探索性
- **无验证**: 缺少质量引导，用户难以改进提示词

### 3. 质量评分算法

**Decision**: 简单规则算法（规则引擎）

**Algorithm**:

```typescript
function calculateQualityScore(prompt: Prompt): QualityScore {
  let score = 0;
  const warnings: string[] = [];

  // 基础分：有 lyrics 或 style (必需)
  if (!prompt.lyrics && !prompt.style) {
    return { score: "rejected", warnings: ["必须提供歌词或风格"] };
  }

  // lyrics 评分 (40 分)
  if (prompt.lyrics) {
    const tags = countSectionTags(prompt.lyrics);
    if (tags >= 3) score += 40;
    else if (tags >= 1) score += 20;
    else warnings.push("缺少章节标签，建议使用 [Verse]、[Chorus] 等");

    if (prompt.lyrics.length > 3500) {
      score -= 10;
      warnings.push("歌词超过 3500 字符，可能影响生成");
    }
  } else {
    warnings.push("建议添加歌词以提高生成质量");
  }

  // style 评分 (30 分)
  if (prompt.style) {
    if (prompt.style.length > 50) score += 30;
    else if (prompt.style.length > 10) score += 15;

    if (prompt.style.length > 2000) {
      score -= 10;
      warnings.push("风格描述超过 2000 字符");
    }
  } else {
    warnings.push("建议添加风格描述");
  }

  // vocal & instrumental 评分 (各 15 分)
  if (prompt.vocal) score += 15;
  else warnings.push("建议添加人声参数");

  if (prompt.instrumental) score += 15;
  else warnings.push("建议添加器乐配置");

  // 计算最终评分
  if (score >= 80) return { score: "high", warnings };
  if (score >= 50) return { score: "medium", warnings };
  return { score: "low", warnings };
}
```

**Rationale**:

- **透明性**: 规则清晰，用户容易理解评分依据
- **可调整**: 规则参数可快速调整，无需重新训练
- **性能**: 计算速度快 (<1ms)，满足 200ms 验证要求
- **无依赖**: 不需要 ML 库，减少复杂度

**Alternatives Considered**:

- **ML 模型**: 过于复杂，MVP 阶段不必要
- **无评分**: 缺少质量反馈机制

### 4. UI 框架：shadcn/ui vs Material-UI vs Ant Design

**Decision**: shadcn/ui + Radix UI + Tailwind CSS

**Rationale**:

- **已有依赖**: 项目已配置 shadcn/ui 和 Tailwind
- **组件控制**: shadcn 是复制到项目的组件，完全可定制
- **TypeScript 原生**: 类型安全
- **轻量级**: 不引入大型库，bundle size 小
- **可访问性**: 基于 Radix UI，ARIA 标准

**Alternatives Considered**:

- **Material-UI**: 过于重量级，样式定制困难
- **Ant Design**: 样式偏向企业后台，不适合创意工具

### 5. 状态管理：Zustand vs Redux vs React Context

**Decision**: React Context + Server State (无额外库)

**Rationale**:

- **简单场景**: MVP 阶段状态管理需求简单
- **Server State**: 大部分状态来自数据库，使用 React Query 或 SWR
- **无过度设计**: 避免引入不必要的状态管理库
- **Next.js 优化**: Server Components 减少客户端状态

**Alternatives Considered**:

- **Zustand**: 简单但目前不需要全局状态
- **Redux**: 过于复杂，MVP 阶段不必要

### 6. ORM 选型：Prisma vs Drizzle vs Raw SQL

**Decision**: Prisma ORM

**Rationale**:

- **类型安全**: 自动生成 TypeScript 类型
- **迁移管理**: 内置 schema 迁移工具
- **开发体验**: Prisma Studio 可视化数据库
- **生态完善**: Next.js 官方推荐

**Alternatives Considered**:

- **Drizzle**: 更轻量但生态较小
- **Raw SQL**: 灵活但缺少类型安全和迁移管理

### 7. 测试框架：Vitest vs Jest

**Decision**: Vitest + React Testing Library

**Rationale**:

- **Vite 原生**: 与 Next.js 现代构建工具对齐，启动速度快
- **ESM 原生支持**: 无需配置转译，支持现代模块系统
- **兼容 Jest API**: 几乎零学习成本，迁移简单
- **更快的执行**: HMR 级别的测试热重载
- **TypeScript 原生**: 无需额外配置即可测试 TS 文件

**Alternatives Considered**:

- **Jest**: 成熟但配置复杂，ESM 支持不佳
- **Node Test Runner**: 原生但功能有限，生态较小

## Technology Stack Summary

| Layer            | Technology                       | Justification                         |
| ---------------- | -------------------------------- | ------------------------------------- |
| **Frontend**     | Next.js 16 App Router + React 19 | 全栈框架，Server Components，已有基础 |
| **UI Framework** | shadcn/ui + Radix UI + Tailwind  | 已配置，轻量级，可定制                |
| **Language**     | TypeScript 5.9                   | 类型安全，团队熟悉                    |
| **Database**     | PostgreSQL                       | 关系型，JSONB 支持，扩展性            |
| **ORM**          | Prisma                           | 类型安全，迁移管理，开发体验          |
| **Validation**   | JSON Schema (Ajv)                | 标准格式，性能好                      |
| **Testing**      | Vitest + Playwright              | 单元测试 + E2E 测试，Vite 生态        |
| **Deployment**   | Vercel (推荐)                    | Next.js 原生支持，PostgreSQL 集成     |

## Best Practices Research

### 1. Prompt 数据建模

参考 Minimax Audio Tutorial 的参数结构：

```typescript
interface Prompt {
  id: string; // UUID
  version: string; // Semantic versioning

  // 四个主要组件
  lyrics: string | null; // 支持 14 种章节标签
  style: string | null; // 风格描述
  vocal: VocalParams | null; // 人声参数 (JSON)
  instrumental: InstrumentalParams | null; // 器乐配置 (JSON)

  // 质量元数据
  quality_score: "high" | "medium" | "low";
  quality_warnings: string[]; // JSON array

  // 审计字段
  created_at: DateTime;
  updated_at: DateTime;
}

interface VocalParams {
  gender?: "male" | "female" | "other";
  timbre?: string; // 音色描述
  style?: string; // 演唱风格
  effects?: {
    reverb?: string;
    autoTune?: boolean;
  };
}

interface InstrumentalParams {
  instruments?: string[]; // 乐器列表
  bpm?: number; // 节奏
  production?: string; // 制作参数
}
```

### 2. Output 追踪模型

```typescript
interface Output {
  id: string; // UUID
  prompt_id: string; // Foreign key to Prompt

  audio_url: string; // 外部音频 URL
  model_version: string; // e.g., "Music-2.5"
  generation_params: GenerationParams; // JSON

  created_at: DateTime;
}

interface GenerationParams {
  temperature?: number;
  seed?: number;
  [key: string]: any; // 扩展性
}
```

### 3. API 设计模式

遵循 REST 原则：

- `GET /api/prompts` - 列表（支持分页、排序）
- `POST /api/prompts` - 创建
- `GET /api/prompts/:id` - 详情
- `PUT /api/prompts/:id` - 更新（future）
- `DELETE /api/prompts/:id` - 删除（future）
- `POST /api/prompts/:id/outputs` - 关联输出
- `GET /api/prompts/:id/outputs` - 查询关联

响应格式：

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    version: string;
  };
}
```

### 4. 验证流程

```
用户提交表单
    ↓
前端初步验证 (React Hook Form)
    ↓
调用 POST /api/prompts
    ↓
后端 Schema 验证
    ↓
计算质量评分
    ↓
生成警告列表
    ↓
返回结果（包含警告）
    ↓
前端显示警告 + 允许保存
    ↓
用户确认保存
    ↓
存储到数据库
```

## Performance Considerations

1. **数据库索引**:
   - `prompts.created_at` (列表排序)
   - `outputs.prompt_id` (关联查询)
   - `prompts.quality_score` (过滤)

2. **分页策略**:
   - 使用 cursor-based pagination（更高效）
   - 每页 20 条记录
   - 支持无限滚动

3. **缓存策略**:
   - Schema 定义缓存（静态）
   - 列表数据 SWR 策略（5s stale）
   - 详情页面按需加载

## Security Considerations

MVP 阶段无用户认证，但预留安全措施：

1. **输入验证**: 所有输入经过 Schema 验证，防止 injection
2. **输出编码**: 防止 XSS（React 默认）
3. **CORS 配置**: 限制 API 访问源
4. **Rate Limiting**: API 调用频率限制（future）

## Open Questions (For Phase 1)

- [ ] 数据库迁移策略（Prisma Migrate vs 手动 SQL）
- [ ] 部署环境（Vercel vs 自托管）
- [ ] 监控和日志方案（Vercel Analytics vs 自建）
- [ ] 备份策略（Database snapshots）

## Next Steps

Phase 1 将基于这些研究决策创建：

1. **data-model.md**: 详细的数据库 schema 和 Prisma models
2. **contracts/**: API 端点的 OpenAPI 规范
3. **quickstart.md**: 开发环境设置指南
