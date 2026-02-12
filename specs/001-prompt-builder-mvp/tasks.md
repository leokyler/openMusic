---
description: 'Implementation tasks for Structured Prompt Builder MVP'
---

# Tasks: Structured Prompt Builder MVP

**Input**: Design documents from `/specs/001-prompt-builder-mvp/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/prompts.openapi.yaml, quickstart.md

**Tests**: Tests are NOT explicitly requested in the specification, so test tasks are omitted per template guidelines.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 项目初始化和基本结构

- [x] T001 创建项目根目录结构（app/, lib/, components/, prisma/, tests/）按 plan.md 定义
- [x] T002 配置 Vitest 测试框架，创建 vitest.config.ts 和 tests/setup.ts
- [x] T003 [P] 配置 ESLint 和 Prettier，添加规则到 eslint.config.mjs
- [x] T004 [P] 安装所需依赖：Prisma, Ajv (JSON Schema), @testing-library/react
- [x] T005 创建 .env.example 文件，定义 DATABASE_URL 和其他环境变量模板

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 在任何用户故事实现之前必须完成的核心基础设施

**⚠️ CRITICAL**: 在此阶段完成之前，不能开始任何用户故事工作

### Database & Schema Setup

- [x] T006 创建 Prisma schema 文件 prisma/schema.prisma，定义 Prompt 和 Output 模型
- [x] T007 设置 prisma.config.ts 文件后，运行初始数据库迁移 `prisma migrate dev --name init`
- [x] T008 生成 Prisma Client 类型 `prisma generate`
- [x] T009 [P] 创建 Prisma 客户端单例 lib/prisma.ts
- [x] T010 [P] 创建种子数据脚本 prisma/seed.ts（可选，用于开发）

### Type Definitions

- [x] T011 [P] 定义 Prompt 类型和接口 lib/types/prompt.ts（VocalParams, InstrumentalParams, Prompt, CreatePromptDto）
- [x] T012 [P] 定义 Output 类型和接口 lib/types/output.ts（Output, CreateOutputDto, GenerationParams）
- [x] T013 [P] 定义通用类型 lib/types/common.ts（QualityScore, PaginatedResult, ApiResponse）

### JSON Schema & Validation

- [x] T014 [P] 创建 Prompt JSON Schema 定义 lib/schemas/prompt.schema.ts
- [x] T015 [P] 创建 Output JSON Schema 定义 lib/schemas/output.schema.ts
- [x] T016 实现 Schema 验证工具 lib/schemas/validator.ts（使用 Ajv，集成 prompt 和 output schema）

### Quality Scoring

- [x] T017 实现质量评分算法 lib/models/quality-scorer.ts（规则引擎：标签计数、字段完整度、长度检查）
- [x] T018 添加质量评分单元测试（验证高/中/低评分逻辑）tests/unit/quality-scorer.test.ts

### API Infrastructure

- [x] T019 创建 API 响应工具 lib/utils/api-response.ts（standardized JSON response format）
- [x] T020 创建 API 错误处理中间件 lib/middleware/error-handler.ts
- [x] T021 [P] 创建验证中间件 lib/middleware/validation.ts（使用 validator.ts）

**Checkpoint**: 基础就绪 - 现在可以并行开始用户故事实现

---

## Phase 3: User Story 1 - Create Structured Prompt (Priority: P1) 🎯 MVP

**Goal**: 用户可以通过界面创建结构化的音乐生成提示词，系统自动验证提示词格式并保存

**Independent Test**: 用户填写提示词表单，点击保存，系统验证并存储提示词，返回提示词 ID。可以通过 API 或 UI 独立测试。

### Service Layer

- [x] T022 [US1] 实现 PromptService lib/services/prompt.service.ts
  - createPrompt() - 创建提示词并计算质量评分
  - validatePrompt() - 验证提示词结构并生成警告
  - Private helper: calculateQuality() - 调用 quality-scorer

### API Endpoints

- [x] T023 [US1] 实现 POST /api/prompts 路由 app/api/prompts/route.ts
  - 接收 CreatePromptDto
  - 验证 JSON Schema
  - 调用 PromptService.createPrompt()
  - 返回创建的 Prompt（包含 quality_score 和 warnings）

### UI Components

- [x] T024 [P] [US1] 创建基础 UI 组件 components/ui/（button, input, textarea, badge, alert）使用 shadcn/ui
- [x] T025 [P] [US1] 创建 QualityBadge 组件 components/prompt/quality-badge.tsx（显示 high/medium/low 评分）
- [x] T026 [P] [US1] 创建 ValidationAlert 组件 components/prompt/validation-alert.tsx（显示警告列表）
- [x] T027 [US1] 创建 PromptForm 组件 components/prompt/prompt-form.tsx
  - 表单字段：lyrics (textarea), style (textarea), vocal (JSON), instrumental (JSON)
  - 客户端验证（字符数限制）
  - 提交处理和错误显示
- [x] T028 [US1] 创建提示词创建页面 app/prompts/new/page.tsx
  - 渲染 PromptForm
  - 处理提交到 POST /api/prompts
  - 显示质量评分和警告
  - 成功后重定向到详情页

### Integration

- [x] T029 [US1] 实现表单验证逻辑（前端 + 后端）
  - 空提示词拒绝（唯一硬性约束）
  - 长度警告（lyrics > 3500, style > 2000）
  - 章节标签检查
- [x] T030 [US1] 添加用户友好的错误消息（90% 用户无需文档理解，SC-005）

**Checkpoint**: 此时 User Story 1 应完全可用且可独立测试 - 用户可以创建和保存提示词

---

## Phase 4: User Story 2 - View and Retrieve Prompts (Priority: P2)

**Goal**: 用户可以查看自己创建的所有提示词列表，并检索特定提示词查看详细内容

**Independent Test**: 用户访问提示词列表页面，查看所有提示词，点击某个提示词查看详情。可以通过准备测试数据独立测试此功能。

### Service Layer

- [x] T031 [US2] 扩展 PromptService lib/services/prompt.service.ts
  - getPromptById(id) - 根据 ID 获取提示词详情（包含 outputs）
  - listPrompts(options) - 分页列表查询，支持过滤和排序

### API Endpoints

- [x] T032 [US2] 实现 GET /api/prompts 路由 app/api/prompts/route.ts
  - 查询参数：page, pageSize, qualityScore, sortBy, sortOrder
  - 调用 PromptService.listPrompts()
  - 返回 PaginatedResult<Prompt>
- [x] T033 [US2] 实现 GET /api/prompts/[id]/route.ts
  - 路径参数：id
  - 调用 PromptService.getPromptById()
  - 返回 Prompt 详情（包含关联 outputs）
  - 404 处理（提示词不存在）

### UI Components

- [x] T034 [P] [US2] 创建 PromptCard 组件 components/prompt/prompt-card.tsx
  - 显示提示词摘要（lyrics 前 100 字符，style，quality_score）
  - 创建时间、输出数量
  - 点击导航到详情页
- [x] T035 [P] [US2] 创建 PromptList 组件 components/prompt/prompt-list.tsx
  - 渲染 PromptCard 列表
  - 分页控制
  - 空状态处理
- [x] T036 [US2] 创建提示词列表页面 app/prompts/page.tsx
  - 从 GET /api/prompts 获取数据
  - 渲染 PromptList
  - 添加"创建新提示词"按钮
  - 实现分页和过滤 UI

### Detail Page

- [x] T037 [P] [US2] 创建 PromptDetail 组件 components/prompt/prompt-detail.tsx
  - 显示完整的 lyrics, style, vocal, instrumental
  - 显示质量评分和警告
  - 显示元数据（id, version, created_at, updated_at）
- [x] T038 [US2] 创建提示词详情页面 app/prompts/[id]/page.tsx
  - 从 GET /api/prompts/:id 获取数据
  - 渲染 PromptDetail
  - 404 错误处理

### Integration

- [x] T039 [US2] 实现列表页性能优化（<1s 加载 100 条记录，SC-003）
  - 添加数据库索引（created_at, quality_score）
  - 实现分页查询优化
- [x] T040 [US2] 添加加载状态和错误处理到所有页面

**Checkpoint**: 此时 User Stories 1 和 2 都应独立工作 - 用户可以创建、查看列表、查看详情

---

## Phase 5: User Story 3 - Associate Generated Outputs (Priority: P3)

**Goal**: 用户可以为提示词关联生成的音乐输出信息（音频文件 URL、生成时间、模型参数），建立提示词和输出的追踪关系

**Independent Test**: 用户在提示词详情页面点击"添加输出关联"，输入生成的音频 URL 和参数，系统保存关联。可以通过验证数据库中的关联记录独立测试。

### Service Layer

- [x] T041 [P] [US3] 创建 OutputService lib/services/output.service.ts
  - createOutput(data) - 创建输出并关联到提示词
  - getOutputsByPromptId(promptId) - 获取提示词的所有输出
  - validateOutputData() - 验证 URL 格式等

### API Endpoints

- [x] T042 [US3] 实现 POST /api/prompts/[id]/outputs/route.ts
  - 路径参数：id (promptId)
  - 请求体：CreateOutputDto (audioUrl, modelVersion, generationParams)
  - 验证 promptId 存在
  - 验证 audioUrl 格式
  - 调用 OutputService.createOutput()
  - 返回创建的 Output
- [x] T043 [US3] 实现 GET /api/prompts/[id]/outputs/route.ts
  - 路径参数：id (promptId)
  - 调用 OutputService.getOutputsByPromptId()
  - 返回 Output 列表

### UI Components

- [x] T044 [P] [US3] 创建 OutputList 组件 components/output/output-list.tsx
  - 显示输出列表（audioUrl, modelVersion, createdAt）
  - 空状态（无输出）
  - 每个输出显示生成参数
- [x] T045 [P] [US3] 创建 OutputForm 组件 components/output/output-form.tsx
  - 表单字段：audioUrl (input), modelVersion (input), generationParams (JSON textarea)
  - 客户端验证（URL 格式）
  - 提交处理

### Integration

- [x] T046 [US3] 将 OutputList 集成到 PromptDetail 组件 components/prompt/prompt-detail.tsx
  - 在提示词详情下方显示关联输出
  - 添加"关联新输出"按钮
- [x] T047 [US3] 在详情页面添加输出关联功能 app/prompts/[id]/page.tsx
  - 渲染 OutputForm（初始隐藏）
  - 点击"关联新输出"显示表单
  - 提交后刷新输出列表
- [x] T048 [US3] 实现双向追溯逻辑
  - Output 可以追溯到 Prompt（通过 prompt_id）
  - Prompt 可以查看关联 Outputs（已在 T046 实现）
  - 验证 onDelete: Cascade 行为

**Checkpoint**: 所有用户故事现在应独立且协同工作 - 完整的提示词生命周期

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 改进影响多个用户故事的横切关注点

### Performance & Optimization

- [ ] T049 [P] 验证 Schema 验证性能 <200ms（SC-002）- 添加性能测试 tests/unit/validation-performance.test.ts
- [ ] T050 [P] 验证列表页加载 <1s/100 条记录（SC-003）- 添加性能基准测试
- [ ] T051 优化数据库查询，确保支持 10k+ 提示词（SC-004）
  - 检查索引有效性
  - 添加查询性能监控

### User Experience

- [ ] T052 [P] 改进全局样式和主题 app/globals.css
- [ ] T053 [P] 添加响应式布局优化（移动端适配）
- [ ] T054 添加加载动画和骨架屏到所有列表和详情页面
- [ ] T055 [P] 改进错误消息清晰度（SC-005）- 确保 90% 用户无需文档理解

### Documentation

- [ ] T056 [P] 创建 README.md 添加项目概述、安装和运行说明
- [ ] T057 [P] 验证 quickstart.md 的所有步骤可执行
- [ ] T058 [P] 添加 API 文档链接到 contracts/prompts.openapi.yaml

### Code Quality

- [x] T059 [P] 代码清理和重构（移除未使用代码、统一命名）
- [x] T060 [P] 添加 JSDoc 注释到所有公共函数和组件
- [x] T061 运行完整的 lint 和 format 检查 `pnpm lint && pnpm format`

### Final Validation

- [x] T062 运行数据库迁移测试（重置、迁移、种子）
- [x] T063 端到端验证所有用户故事
  - US1: 创建提示词
  - US2: 查看列表和详情
  - US3: 关联输出
- [x] T064 验证所有 Success Criteria（SC-001 到 SC-006）
- [x] T065 准备部署到 Vercel（配置环境变量、数据库连接）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - 阻塞所有用户故事
- **User Stories (Phase 3-5)**: 全部依赖 Foundational 完成
  - User Story 1 (P1): 无依赖（除 Phase 2）
  - User Story 2 (P2): 无依赖（除 Phase 2）- 独立可测试
  - User Story 3 (P3): 无依赖（除 Phase 2）- 独立可测试
  - **用户故事可并行实现**（如有多人）
- **Polish (Phase 6)**: 依赖所有期望的用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: 在 Foundational (Phase 2) 后可开始 - 无其他故事依赖
- **User Story 2 (P2)**: 在 Foundational (Phase 2) 后可开始 - 读取 US1 创建的数据但独立可测
- **User Story 3 (P3)**: 在 Foundational (Phase 2) 后可开始 - 扩展 US1/US2 但独立可测

### Within Each User Story

- Service layer → API endpoints → UI components → Integration
- 标记 [P] 的任务可并行执行（不同文件，无依赖）
- 故事完成后再转移到下一个优先级

### Parallel Opportunities

#### Setup Phase (Phase 1)

```bash
# 可同时执行：
T003 [P] 配置 ESLint/Prettier
T004 [P] 安装依赖
```

#### Foundational Phase (Phase 2)

```bash
# Database setup（顺序）:
T006 → T007 → T008

# 可同时执行：
T009 [P] Prisma 客户端单例
T010 [P] 种子数据
T011 [P] Prompt 类型
T012 [P] Output 类型
T013 [P] 通用类型
T014 [P] Prompt schema
T015 [P] Output schema
T021 [P] 验证中间件
```

#### User Story 1 (Phase 3)

```bash
# 可同时执行：
T024 [P] [US1] UI 基础组件
T025 [P] [US1] QualityBadge
T026 [P] [US1] ValidationAlert

# 顺序：
T022 [US1] PromptService → T023 [US1] API endpoint → T027 [US1] PromptForm → T028 [US1] 创建页面
```

#### User Story 2 (Phase 4)

```bash
# 可同时执行：
T034 [P] [US2] PromptCard
T035 [P] [US2] PromptList
T037 [P] [US2] PromptDetail

# 顺序：
T031 [US2] Service 扩展 → (T032 [US2] 列表 API, T033 [US2] 详情 API) → UI 页面
```

#### User Story 3 (Phase 5)

```bash
# 可同时执行：
T041 [P] [US3] OutputService
T044 [P] [US3] OutputList
T045 [P] [US3] OutputForm

# 顺序：
T041 → (T042 [US3] POST API, T043 [US3] GET API) → T046/T047 [US3] 集成
```

#### Polish Phase (Phase 6)

```bash
# 可同时执行多数任务：
T049 [P] 性能测试
T050 [P] 基准测试
T052 [P] 全局样式
T053 [P] 响应式
T055 [P] 错误消息
T056 [P] README
T057 [P] 验证 quickstart
T058 [P] API 文档
T059 [P] 代码清理
T060 [P] JSDoc
```

---

## Parallel Example: User Story 1

```bash
# 同时启动所有 [P] UI 组件（US1）：
Task T024: components/ui/* (shadcn/ui 基础组件)
Task T025: components/prompt/quality-badge.tsx
Task T026: components/prompt/validation-alert.tsx

# 然后顺序执行核心逻辑：
Task T022: lib/services/prompt.service.ts
Task T023: app/api/prompts/route.ts
Task T027: components/prompt/prompt-form.tsx
Task T028: app/prompts/new/page.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. ✅ 完成 Phase 1: Setup
2. ✅ 完成 Phase 2: Foundational（CRITICAL - 阻塞所有故事）
3. ✅ 完成 Phase 3: User Story 1
4. **STOP and VALIDATE**: 独立测试 User Story 1
5. 如果就绪则部署/演示

此时系统已可用：用户可以创建、验证和保存结构化提示词。

### Incremental Delivery

1. Setup + Foundational → 基础就绪
2. 添加 User Story 1 → 独立测试 → 部署/演示（MVP！）
3. 添加 User Story 2 → 独立测试 → 部署/演示
4. 添加 User Story 3 → 独立测试 → 部署/演示
5. 每个故事增加价值而不破坏之前的故事

### Parallel Team Strategy

如有多位开发人员：

1. 团队共同完成 Setup + Foundational
2. Foundational 完成后：
   - Developer A: User Story 1（T022-T030）
   - Developer B: User Story 2（T031-T040）
   - Developer C: User Story 3（T041-T048）
3. 故事独立完成和集成

---

## Suggested MVP Scope

仅 **User Story 1（P1）** 即可构成可用的 MVP：

- ✅ 用户可以创建结构化提示词
- ✅ 系统验证并显示质量评分
- ✅ 系统显示警告但允许保存
- ✅ 提示词持久化到数据库

此 MVP 验证核心价值主张：结构化提示词管理系统的可行性。

**User Story 2 和 3** 是增量增强，可在 MVP 验证后添加。

---

## Task Summary

- **Total Tasks**: 65
- **Setup (Phase 1)**: 5 tasks
- **Foundational (Phase 2)**: 16 tasks ⚠️ BLOCKING
- **User Story 1 (P1)**: 9 tasks 🎯 MVP
- **User Story 2 (P2)**: 10 tasks
- **User Story 3 (P3)**: 8 tasks
- **Polish (Phase 6)**: 17 tasks

**Parallel Opportunities**: 25 tasks marked [P] 可并行执行

**Independent Tests per Story**:

- US1: 表单提交 → API 创建 → 数据库验证
- US2: 列表查询 → 详情查询 → UI 渲染
- US3: 输出关联 → 双向追溯 → 列表显示

---

## Notes

- ✅ 所有任务遵循 `- [ ] [ID] [P?] [Story?] Description with path` 格式
- ✅ Tasks 按用户故事组织，实现独立性
- ✅ Phase 2 是关键阻塞点 - 必须先完成
- ✅ 每个用户故事可独立测试和交付
- ✅ [P] 标记识别并行机会（25 个任务）
- ❌ 未包含测试任务（规范中未明确要求）
- ✅ MVP 范围清晰：仅 US1 即可交付价值
- ✅ 增量交付策略：US1 → US2 → US3
- ✅ 所有文件路径明确，遵循 plan.md 项目结构
