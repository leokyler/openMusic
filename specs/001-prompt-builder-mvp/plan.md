# Implementation Plan: Structured Prompt Builder MVP

**Branch**: `001-prompt-builder-mvp` | **Date**: 2026-02-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-prompt-builder-mvp/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

创建一个 MVP 系统，用于结构化 AI 音乐提示词的生成、验证和存储。系统基于 Minimax 音频生成模型的参数定义（lyrics, style, vocal, instrumental），实现灵活的质量评分机制：提示词结构约束是强建议性而非强制性，通过质量评分（高/中/低）引导用户采用最佳实践。核心功能包括：1）提示词 CRUD 操作，2）JSON Schema 验证与警告，3）输出追踪和双向关联。技术方案采用 Next.js + TypeScript 全栈架构，PostgreSQL 存储，确保提示词数据结构化、可追溯和版本化。

## Technical Context

**Language/Version**: TypeScript 5.9.3 / Node.js (pnpm 10.19.0)
**Primary Dependencies**: Next.js 16.1.5, React 19.2, Tailwind CSS 4.1, shadcn/ui 组件库, Radix UI
**Storage**: PostgreSQL (关系型数据库，存储提示词和输出关联)
**Testing**: Vitest + React Testing Library（单元测试），Playwright（E2E 测试）
**Target Platform**: Web 应用（现代浏览器），服务端 Next.js App Router
**Project Type**: Web 应用（frontend + backend API routes in Next.js）
**Performance Goals**:

- Schema 验证 <200ms (FR-002, SC-002)
- 列表页加载 <1s/100 条记录 (SC-003)
- 支持 10k+ 提示词无性能降级 (SC-004)
  **Constraints**:
- 灵活验证策略：警告而非阻止（除完全空提示词）
- 质量评分算法简单规则（标签数量、字段完整度）
- 无用户认证（MVP 阶段）
  **Scale/Scope**: MVP 阶段，预估 100-1000 个提示词，单用户场景（无权限系统）

## Constitution Check

_GATE: 必须在 Phase 0 研究前通过。Phase 1 设计后重新检查。_

**Structured Prompt Design**:

- [x] 功能涉及提示词 schema 定义或修改 - 定义 Prompt 实体的完整 JSON Schema
- [x] Schemas 包含所有必需组件（lyrics, style, vocal, instrumental, structural） - 四个主要组件完整定义
- [x] 定义了歌词结构的章节标签（[Verse]、[Chorus]、[Bridge] 等） - 支持 14 种标准章节标签

**Output Traceability**:

- [x] 元数据模型包含提示词版本、时间戳、模型参数 - Prompt 包含 id, version, created_at, updated_at
- [x] 指定了提示词与输出之间的双向链接 - Output 实体包含 prompt_id 外键，支持双向查询
- [x] Association 记录在设计中是不可变的 - created_at 时间戳不可修改

**Schema Validation**:

- [x] 为所有提示词组件定义了 JSON schemas - 使用 JSON Schema 验证所有字段
- [x] 在生成请求前指定验证逻辑 - FR-005 要求保存时验证，但允许警告后保存
- [x] 验证失败的错误消息清晰明确 - FR-005, SC-005 要求 90% 用户无需文档即可理解

**Version Control**:

- [x] Schema/提示词版本号遵循语义化版本控制（MAJOR.MINOR.PATCH） - Prompt 实体包含 version 字段
- [ ] 破坏性变更包含迁移指南 - MVP 暂不支持版本控制功能（Out of Scope）
- [x] 版本元数据与所有提示词关联 - 每个 Prompt 记录都有 version 字段

**Text-Based Workflow**:

- [x] 提示词格式使用 JSON、YAML 或 Markdown - 存储为 JSON，UI 支持文本编辑
- [ ] 支持可组合性（片段组合成完整提示词） - MVP 阶段不支持（简化功能）
- [x] 指定了 CLI 或程序化接口 - REST API 端点提供程序化访问

**⚠️ 备注**: 两项未完全满足的要求都在 MVP 范围外，符合简化策略。版本控制和可组合性将在后续版本中添加。

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/                          # Next.js App Router
├── api/                      # API Routes
│   ├── prompts/              # Prompt CRUD endpoints
│   │   ├── route.ts          # GET /api/prompts (list), POST /api/prompts (create)
│   │   └── [id]/
│   │       ├── route.ts      # GET/PUT /api/prompts/:id
│   │       └── outputs/
│   │           └── route.ts  # POST /api/prompts/:id/outputs (associate output)
│   ├── outputs/              # Output management
│   │   └── route.ts          # GET /api/outputs (list)
│   └── schemas/              # Schema validation endpoint
│       └── validate/
│           └── route.ts      # POST /api/schemas/validate
├── prompts/                  # Prompt pages
│   ├── page.tsx              # List page
│   ├── new/
│   │   └── page.tsx          # Create page
│   └── [id]/
│       ├── page.tsx          # Detail page
│       └── edit/
│           └── page.tsx      # Edit page (future)
├── layout.tsx                # Root layout
├── page.tsx                  # Home page
└── globals.css               # Global styles

lib/                          # Shared utilities
├── db/                       # Database client
│   ├── client.ts             # PostgreSQL connection
│   └── migrations/           # DB migrations
│       ├── 001_create_prompts.sql
│       └── 002_create_outputs.sql
├── schemas/                  # JSON Schemas
│   ├── prompt.ts             # Prompt JSON Schema definition
│   ├── output.ts             # Output JSON Schema definition
│   └── validator.ts          # Schema validation logic
├── models/                   # Data models & types
│   ├── prompt.ts             # Prompt TypeScript types
│   ├── output.ts             # Output TypeScript types
│   └── quality-scorer.ts     # Quality scoring algorithm
├── services/                 # Business logic
│   ├── prompt-service.ts     # Prompt operations
│   ├── output-service.ts     # Output operations
│   └── validation-service.ts # Validation logic
└── utils.ts                  # Helper functions

components/                   # React components
├── ui/                       # shadcn/ui components
│   ├── button.tsx
│   ├── input.tsx
│   ├── textarea.tsx
│   ├── badge.tsx             # For quality indicators
│   └── alert.tsx             # For warnings
├── prompt/                   # Prompt-specific components
│   ├── prompt-form.tsx       # Create/edit form
│   ├── prompt-list.tsx       # List view
│   ├── prompt-card.tsx       # List item card
│   ├── quality-indicator.tsx # Quality score display
│   └── validation-alert.tsx  # Validation warnings
└── output/                   # Output-specific components
    ├── output-form.tsx       # Associate output form
    └── output-list.tsx       # Output list display

public/                       # Static assets
└── (existing files)

tests/                        # Test files
├── unit/                     # Unit tests
│   ├── models/               # Model tests
│   ├── services/             # Service tests
│   └── schemas/              # Schema validation tests
├── integration/              # Integration tests
│   └── api/                  # API endpoint tests
└── e2e/                      # E2E tests (Playwright)
    ├── prompt-crud.spec.ts
    └── output-association.spec.ts
```

**Structure Decision**: 采用 Next.js App Router 架构，全栈应用在单一代码库中。选择此结构的原因：

1. **简化部署**: 单一应用，无需分离前后端部署
2. **类型安全**: TypeScript 在前后端共享类型定义
3. **开发效率**: 热重载，统一开发体验
4. **现有基础**: 项目已使用 Next.js 16.1.5，直接利用现有配置
5. **API Routes**: 内置 API 支持，无需单独后端框架

## Complexity Tracking

> **No violations** - 所有未满足的宪法要求都在 MVP 范围外，符合简化策略。

**简化决策记录**:

| 功能                 | 为何推迟                     | 影响                           |
| -------------------- | ---------------------------- | ------------------------------ |
| 提示词版本控制和历史 | MVP 专注核心 CRUD 功能       | 用户暂时无法回滚提示词版本     |
| 提示词片段可组合性   | 增加复杂度，优先验证基础功能 | 用户需手动复制粘贴常用片段     |
| 用户认证和权限       | 简化 MVP，单用户场景         | 所有提示词公开访问             |
| 与 Minimax API 集成  | 避免第三方依赖，降低风险     | 用户需手动复制提示词到 Minimax |

**复杂度控制措施**:

- 质量评分使用简单规则算法（标签计数 + 字段完整度），避免 ML 模型
- 数据库 schema 设计支持未来扩展（如 user_id 字段预留）
- 验证逻辑分离，便于后续优化算法
- UI 组件模块化，支持渐进增强
