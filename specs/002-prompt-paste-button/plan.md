# Implementation Plan: Prompt Paste Button

**Branch**: `002-prompt-paste-button` | **Date**: 2026-02-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-prompt-paste-button/spec.md`

**Note**: This template is filled in by `/speckit.plan` command. See `.specify/templates/commands/plan.md` for execution workflow.

## Summary

在提示词表单页面和详情页面添加"复制提示词"按钮，允许用户一键将格式化的提示词文本复制到剪贴板，用于粘贴到外部 AI 音乐生成工具（如 Minimax、Suno）。功能包括：1）浏览器 Clipboard API 支持及降级方案，2）键盘无障碍访问（WCAG 2.1 AA），3）匿名使用追踪（复制次数、最后复制时间），4）统一的英文字段标签格式（lyrics、style、vocal、instrumental）。技术方案在现有 Next.js + React 前端架构基础上扩展 Prompt 实体，使用 clipboard.js 库实现跨浏览器兼容，通过 Prisma 追踪复制指标。

## Technical Context

**Language/Version**: TypeScript 5.9.3 / Node.js (pnpm 10.19.0)
**Primary Dependencies**: Next.js 16.1.5, React 19.2.3, clipboard.js (或原生 Clipboard API), Prisma 7.3.0
**Storage**: PostgreSQL (扩展现有 Prompt 实体，添加 copy_count 和 last_copied_at 字段)
**Testing**: Vitest + React Testing Library（单元测试），Playwright（E2E 测试剪贴板操作）
**Target Platform**: Web 应用（现代浏览器，通过降级方案支持旧浏览器）
**Project Type**: Web 应用（frontend + backend API routes in Next.js）
**Performance Goals**:

- 复制操作 <100ms (SC-001)
- 浏览器兼容性 95% (SC-002)
- 用户发现率 95% (SC-003)
- 粘贴成功率 ≥98% (SC-004)

**Constraints**:

- 必须支持键盘访问（Tab 导航 + Enter/Space），符合 WCAG 2.1 AA
- 必须提供降级方案（document.execCommand('copy')）以支持旧浏览器
- 复制指标匿名追踪，不关联用户身份
- 只复制已填写的字段，忽略空字段

**Scale/Scope**: MVP 阶段，2 个页面（表单页和详情页），预计与 001 功能配合使用，预估 100-1000 个提示词

## Constitution Check

_GATE: 必须在 Phase 0 研究前通过。Phase 1 设计后重新检查。_

**Structured Prompt Design**:

- [N/A] 功能涉及提示词 schema 定义或修改 - 本功能不修改提示词 schema，仅在 UI 层添加复制按钮
- [N/A] Schemas 包含所有必需组件 - 复制功能使用现有 schema，不引入新字段定义
- [N/A] 定义了歌词结构的章节标签 - 复制文本格式使用英文字段标签，不定义新标签规则

**Justification**: 本功能是纯 UI 增强功能，不修改提示词的数据模型或验证逻辑。复制的文本格式与现有 schema 保持一致。

**Output Traceability**:

- [x] 元数据模型包含提示词版本、时间戳、模型参数 - 扩展 Prompt 实体添加 copy_count 和 last_copied_at
- [N/A] 指定了提示词与输出之间的双向链接 - 本功能不涉及输出关联
- [N/A] Association 记录在设计中是不可变的 - 复制指标可变（计数增加），不适用不可变性要求

**Justification**: 复制追踪是使用度量，不属于输出可追溯性范畴。copy_count 和 last_copied_at 是可变的提示词属性，每次复制时更新。

**Schema Validation**:

- [N/A] 为所有提示词组件定义了 JSON schemas - 本功能不定义新 schemas
- [N/A] 在生成请求前指定验证逻辑 - 复制功能不涉及验证
- [N/A] 验证失败的错误消息清晰明确 - 不适用

**Version Control**:

- [N/A] Schema/提示词版本号遵循语义化版本控制 - 不修改 schema，版本号不变
- [N/A] 破坏性变更包含迁移指南 - 无破坏性变更
- [N/A] 版本元数据与所有提示词关联 - 使用现有版本系统

**Text-Based Workflow**:

- [x] 提示词格式使用 JSON、YAML 或 Markdown - 复制输出纯文本格式（带英文字段标签）
- [N/A] 支持可组合性 - 不涉及提示词组合
- [N/A] 指定了 CLI 或程序化接口 - 本功能是 Web UI 功能

## Project Structure

### Documentation (this feature)

```text
specs/002-prompt-paste-button/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── prompt-copy.openapi.yaml
└── tasks.md            # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

Based on existing Next.js App Router structure from feature 001 (without src directory):

```text
app/
├── prompts/
│   ├── [id]/              # Prompt detail page
│   │   └── page.tsx      # Add copy button
│   └── new/              # Prompt form page
│       └── page.tsx        # Add copy button
└── api/
    └── prompts/
        └── [id]/
            └── copy/route.ts  # POST /api/prompts/:id/copy (track copy metrics)
components/
├── prompt/
│   ├── CopyPromptButton.tsx     # New: Reusable copy button component
│   └── PromptForm.tsx           # Modify: Add copy button to form
└── ui/                          # Existing shadcn/ui components
lib/
├── clipboard.ts                    # New: Clipboard utilities (Clipboard API + fallback)
├── prompt-formatter.ts            # New: Format prompt for copy (English labels)
└── types/
    └── prompt.ts                   # Modify: Extend Prompt type with copy tracking (existing location)

prisma/
└── schema.prisma                       # Modify: Add copy_count and last_copied_at to Prompt model

tests/
├── unit/
│   ├── lib/
│   │   ├── clipboard.test.ts          # New: Test clipboard utilities
│   │   └── prompt-formatter.test.ts  # New: Test formatting logic
│   └── components/
│       └── CopyPromptButton.test.ts   # New: Test button component
└── e2e/
    ├── prompt-form-copy.spec.ts        # New: Test form page copy flow
    └── prompt-detail-copy.spec.ts      # New: Test detail page copy flow
```

**Structure Decision**: 采用 Option 2 (Web application)，因为项目使用 Next.js 全栈架构。本功能主要在 frontend 层实现 UI 组件和剪贴板逻辑，backend 层添加复制追踪 API 端点。数据模型扩展现有 Prisma schema。

## Complexity Tracking

> **Constitution Check passed with no violations requiring justification**.

本功能是纯 UI 增强功能，不修改提示词 schema 或核心验证逻辑。所有宪法原则要么适用（如文本格式、使用度量追踪），要么不适用（如 schema 定义、输出关联）。无需额外复杂性。

---

## Phase 1 Completion

✅ **Research Complete** (`research.md`):

- Clipboard 实现方案：clipboard.js + 原生 API 降级
- 键盘无障碍：原生 button + ARIA 属性（WCAG 2.1 AA）
- 使用追踪：后端 API + Prisma 原子计数（匿名）
- 浏览器兼容：Feature detection + Progressive enhancement
- 提示词格式化：英文标签 + 纯文本格式
- E2E 测试：Playwright + clipboard API mocking

✅ **Data Model Complete** (`data-model.md`):

- 扩展 Prompt 实体：添加 `copy_count` 和 `last_copied_at`
- TypeScript 类型定义完整
- Prisma 迁移策略清晰
- 并发安全（原子操作）保证
- 隐私合规（匿名追踪）

✅ **API Contract Complete** (`contracts/prompt-copy.openapi.yaml`):

- POST /api/prompts/:id/copy 端点定义
- 请求/响应 schema 规范
- 错误处理完整（400, 404, 500）
- OpenAPI 3.0.3 标准格式
- JavaScript 代码示例

✅ **Quickstart Complete** (`quickstart.md`):

- 端到端开发流程（依赖安装 → 迁移 → 实现 → 测试）
- Clipboard 工具函数实现示例
- 复制按钮组件实现示例
- API 端点实现示例
- 本地测试清单（手动 + 自动化）
- 常见问题解答

✅ **Agent Context Updated**:

- 技术栈已添加到 AGENTS.md：clipboard.js, Prisma 扩展
- 所有后续 AI 辅助工具将使用最新技术上下文

---

## Re-Evaluation: Constitution Check (Post-Phase 1)

**Structured Prompt Design**: ✅ N/A

- 本功能不修改 prompt schema，仅在 UI 层添加复制按钮
- 复制的文本格式与现有 schema 保持一致（英文标签）

**Output Traceability**: ✅ Compliant

- 扩展 Prompt 实体添加使用指标（copy_count, last_copied_at）
- 不涉及提示词与输出的关联（本功能范围外）

**Schema Validation**: ✅ N/A

- 本功能不定义新 schemas，使用现有验证逻辑

**Version Control**: ✅ Compliant

- 不修改 schema，版本号保持不变
- 数据库迁移向后兼容（新字段有默认值）

**Text-Based Workflow**: ✅ Partially Compliant

- 复制输出纯文本格式（带英文字段标签）
- 不涉及提示词组合或 CLI 工具

**Final Verdict**: ✅ **PASSED** - 所有适用的宪法原则已满足，无违规。

---

## Next Phase: Phase 2 (Task Generation)

Phase 1 已完成。下一步运行 `/speckit.tasks` 生成详细的任务列表（`tasks.md`），包括：

1. 数据库迁移任务
2. Prisma schema 更新任务
3. Clipboard 工具函数实现任务
4. 复制按钮组件开发任务
5. API 端点实现任务
6. 页面集成任务（表单页 + 详情页）
7. 单元测试任务
8. E2E 测试任务
9. 文档和验证任务

命令：`/speckit.tasks`
