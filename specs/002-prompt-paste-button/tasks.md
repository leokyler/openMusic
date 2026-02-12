# Implementation Tasks: Prompt Paste Button

**Feature**: 002-prompt-paste-button
**Date**: 2026-02-12
**Branch**: `002-prompt-paste-button`
**Input**: Task breakdown generated from `/speckit.plan` output

---

## Overview

本文档将提示词粘贴按钮功能分解为可执行的任务列表。任务按用户故事组织，支持独立实现和测试。

**Tech Stack**: TypeScript 5.9.3 / Node.js (pnpm 10.19.0), Next.js 16.1.5, React 19.2.3, clipboard.js, Prisma 7.3.0, PostgreSQL

**Path Conventions (Next.js App Router without src)**:

- App Router: `app/` at repository root
- Components: `components/` at repository root
- Libraries: `lib/` at repository root
- Types: `lib/types/` (existing types location)
- Database: `prisma/` at repository root
- Tests: `tests/` at repository root

**Total Tasks**: 43

- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 8 tasks
- Phase 3 (User Story 1 - P1): 15 tasks
- Phase 4 (User Story 2 - P2): 13 tasks
- Phase 5 (Polish): 3 tasks

---

## Dependency Graph

```
 ┌──────────────────────────────────────────────────────────────────┐
 │                    Phase 1: Setup                        │
 │  ┌─────────┐  ┌─────────────┐  ┌──────────────┐ │
 │  │ T001     │  │ T002        │  │ T003         │ │
 │  │ Install   │  │ Update      │  │ Create        │ │
 │  │ clipboard │  │ types       │  │ directories   │ │
 │  └─────┬───┘  └──────┬───────┘  └──────┬───────┘ │
 └─────────┼─────────────────┼─────────────┼───────────────┘
           │             │             │
           ▼             ▼             ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │              Phase 2: Foundational                      │
 │  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
 │  │ T005      │  │ T007      │  │ T009         │ │
 │  │ Prisma    │  │ Prisma    │  │ API          │ │
 │  │ schema    │  │ migration  │  │ route        │ │
 │  └─────┬────┘  └─────┬──────┘  └──────┬───────┘ │
 └─────────┼────────────┼─────────────┼───────────────┘
           │             │             │
           ▼             ▼             ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │          Phase 3: User Story 1 (P1) - Form Page       │
 │  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
 │  │ T013-T014 │  │ T015      │  │ T021         │ │
 │  │ Clipboard  │  │ Component │  │ Form         │ │
 │  │ utils     │  │           │  │ integration  │ │
 │  └─────┬────┘  └─────┬──────┘  └──────┬───────┘ │
 └─────────┼────────────┼─────────────┼───────────────┘
           │             │             │
           ▼             ▼             ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │          Phase 4: User Story 2 (P2) - Detail Page      │
 │  ┌──────────┐  ┌─────────────────────────────────────┐ │
 │  │ T024-T034 │  │                                  │ │
 │  │ Detail    │  │ Reuse CopyPromptButton component   │ │
 │  │ Page      │  │ from US1                         │ │
 │  └──────────┘  └─────────────────────────────────────┘ │
 └──────────────────────────────────────────────────────────────────┘
           │
           ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │              Phase 5: Polish                          │
 │  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
 │  │ T035      │  │ T037      │  │ T038-T043    │ │
 │  │ E2E Tests  │  │ Unit Tests │  │ Docs & QA    │ │
 │  └──────────┘  └──────────┘  └──────────────┘ │
 └──────────────────────────────────────────────────────────────────┘
```

**Critical Path**: T001 → T002 → T003 → T005 → T007 → T009 → T013 → T015 → T021 (MVP: Form page copy button)

**Parallel Opportunities**:

- T002, T003 can run in parallel with T001
- T013, T014 can run in parallel after T009
- T015-T020 can be developed in parallel (component features)
- T024-T034 can be done in parallel with Phase 3 tasks
- T035, T036, T037, T038-T043 can be done in parallel after Phase 4

---

## Phase 1: Setup (Project Initialization)

**Goal**: 初始化开发环境和安装必要依赖

### Setup Tasks

- [x] T001 [P] Install clipboard.js library and TypeScript types in project root
      File: `package.json`
      Command: `pnpm add clipboard @types/clipboard`
      Verify: Check clipboard@^2.0.11 in dependencies

- [x] T002 [P] Update existing TypeScript type definitions for Prompt with copy tracking fields
      File: `lib/types/prompt.ts` (or existing types location)
      Add fields: `copy_count: number`, `last_copied_at: string | null`
      Verify: No TypeScript errors in file

- [x] T003 [P] Create directory structure for feature components and utilities
      Directories: `components/prompt/`, `lib/`, `tests/unit/lib/`
      Command: `mkdir -p components/prompt lib tests/unit/lib`
      Verify: All directories exist

- [x] T004 Create ESLint and Prettier configuration for code quality tools
      File: `.eslintrc.js`, `.prettierrc`
      Add rules for React hooks, accessibility (aria-\*)
      Verify: `pnpm lint` runs without errors

**Independent Test Criteria**:

- [ ] Dependencies installed (clipboard.js visible in package.json)
- [ ] TypeScript compiles without errors (`pnpm check-types`)
- [ ] Directory structure created
- [ ] Linting configuration active

---

## Phase 2: Foundational (Blocking Prerequisites)

**Goal**: 扩展数据模型以支持复制追踪

### Prisma Schema Tasks

- [x] T005 [P] Add copy_count and last_copied_at fields to Prompt model in Prisma schema
      File: `prisma/schema.prisma`
      Add fields: `copy_count Int @default(0)`, `last_copied_at DateTime?`
      Verify: Schema syntax valid (`prisma format`)

- [x] T006 Create index on copy_count for sorting prompts by popularity
      File: `prisma/schema.prisma`
      Add index: `@@index([copy_count(sort: Desc)])`
      Verify: Index definition valid

### Database Migration Tasks

- [x] T007 Generate Prisma migration file for copy tracking fields
      Command: `pnpm prisma migrate dev --name add_copy_tracking`
      Output: `prisma/migrations/xxxxx_add_copy_tracking/migration.sql`
      Verify: Migration file created with ALTER TABLE statements

- [x] T008 Apply database migration to add copy_count and last_copied_at columns
      Command: `pnpm prisma migrate deploy`
      Verify: Columns exist in PostgreSQL (`\d prompts` in psql)

- [x] T009 Regenerate Prisma Client with new Prompt fields
      Command: `pnpm prisma generate`
      Output: `node_modules/.prisma/client` updated
      Verify: `Prisma.prompt` includes `copy_count` and `last_copied_at`

### API Contract Test Tasks

- [x] T010 Create contract test for POST /api/prompts/:id/copy endpoint
      File: `tests/contract/prompt-copy.test.ts`
      Test cases: 200 success, 404 not found, 400 invalid ID
      Verify: All contract tests pass

- [x] T011 [P] Implement copy tracking API route handler
      File: `app/api/prompts/[id]/copy/route.ts`
      Logic: Atomic increment of copy_count, update last_copied_at
      Verify: Returns CopyTrackingResponse with proper structure

- [x] T012 [P] Add error handling for invalid prompt IDs in copy API
      File: `app/api/prompts/[id]/copy/route.ts`
      Logic: Check prompt existence before update, return 404 if not found
      Verify: 404 response matches OpenAPI spec

**Independent Test Criteria**:

- [ ] Database migration applied (columns exist in database)
- [ ] Prisma Client regenerated with new fields
- [ ] Contract tests pass for copy endpoint
- [ ] API returns 200 with incremented copy_count
- [ ] API returns 404 for non-existent prompts

---

## Phase 3: User Story 1 - Paste from Form Page (Priority: P1)

**Goal**: 用户在创建或编辑提示词时，可以通过点击复制按钮快速将提示词内容复制到剪贴板，以便直接粘贴到 AI 音乐生成工具中使用。

**Independent Test Criteria**:

- [ ] 用户访问提示词表单页面，填写内容，点击复制按钮，提示词被复制到剪贴板
- [ ] 用户粘贴剪贴板内容到外部应用，格式正确（英文字段标签）
- [ ] 用户使用键盘（Tab + Enter）可触发复制操作
- [ ] 复制操作在 100ms 内完成，显示成功 Toast 提示

### Clipboard Utility Tasks

- [x] T013 [P] Implement copyToClipboard utility function with clipboard.js integration
      File: `lib/clipboard.ts`
      Functions: `copyToClipboard(text, options)`, `formatPromptForCopy(prompt)`
      Features: clipboard.js initialization, fallback to execCommand, success/error callbacks
      Verify: Function returns Clipboard instance, handles errors gracefully

- [x] T014 Implement formatPromptForCopy utility to format prompt with English labels
      File: `lib/clipboard.ts`
      Logic: Only include filled fields, use English labels (lyrics, style, vocal, instrumental)
      Output: Formatted string with field labels and content separated by newlines
      Verify: Output matches specification in data-model.md

### Form Page Integration Tasks

- [x] T015 [P] Create CopyPromptButton reusable component with icon and label variants
      File: `components/prompt/CopyPromptButton.tsx`
      Props: `prompt: Partial<Prompt>`, `variant?: 'icon-only' | 'with-label'`
      Features: Copy icon, success state (Check icon), disabled state, keyboard accessible
      Verify: Component renders button, accepts props, has proper ARIA labels

- [x] T016 Add loading state to CopyPromptButton during copy operation
      File: `components/prompt/CopyPromptButton.tsx`
      State: `tracking: boolean` to disable button during async copy
      UI: Show loading spinner or disabled state when copying
      Verify: Button disabled during copy operation, re-enables after completion

- [x] T017 Implement success Toast notification after successful copy operation
      File: `components/prompt/CopyPromptButton.tsx`
      UI: "已复制到剪贴板" message, auto-dismiss after 2 seconds
      Verify: Toast appears on success, disappears after timeout

- [x] T018 Add error handling for clipboard permission denial
      File: `components/prompt/CopyPromptButton.tsx`
      UI: Error message with manual copy instructions when clipboard access denied
      Verify: Error Toast displayed when permission rejected, includes manual instructions

- [x] T019 [P] Implement keyboard accessibility attributes on CopyPromptButton
      File: `components/prompt/CopyPromptButton.tsx`
      Attributes: `aria-label="复制提示词到剪贴板"`, `type="button"`, visible focus styles
      Verify: Tab navigates to button, Enter/Space triggers copy, focus outline visible

- [x] T020 Add validation to prevent copy when all prompt fields are empty
      File: `components/prompt/CopyPromptButton.tsx`
      Logic: Check if at least one field (lyrics, style, vocal, instrumental) has content
      UI: Show error Toast "请先填写提示词内容" if all fields empty
      Verify: Copy button disabled or shows error when all fields empty

- [x] T021 Integrate CopyPromptButton into prompt form page bottom action area
      File: `app/prompts/new/page.tsx`
      Location: Below form fields, in action section
      Variant: `with-label` to show "复制" text alongside icon
      Verify: Button visible on form page, properly positioned

### API Integration Tasks

- [x] T022 [P] Implement async copy tracking API call in CopyPromptButton component
      File: `components/prompt/CopyPromptButton.tsx`
      Function: `trackCopy(promptId)` calls POST /api/prompts/:id/copy
      Timing: Async, non-blocking, logs error to console if fails
      Verify: Network request made after successful copy, doesn't block UI

- [x] T023 Add debounce mechanism to prevent duplicate copy operations
      File: `components/prompt/CopyPromptButton.tsx`
      Timing: Disable button for 500ms after copy, prevent rapid repeated clicks
      Verify: Multiple rapid clicks result in single copy operation

---

## Phase 4: User Story 2 - Paste from Detail Page (Priority: P2)

**Goal**: 用户在查看已保存的提示词详情时，可以通过点击复制按钮快速复制提示词内容，以便在 AI 音乐生成工具中重复使用该提示词。

**Independent Test Criteria**:

- [ ] 用户访问提示词列表，点击提示词查看详情
- [ ] 用户在详情页点击复制按钮（顶部或底部），提示词被复制
- [ ] 复制的文本包含所有已填写的字段，格式正确
- [ ] 用户在移动设备上查看详情，复制功能正常工作

### Detail Page Integration Tasks

- [x] T024 [P] Add CopyPromptButton to detail page header (top position)
      File: `app/prompts/[id]/page.tsx`
      Location: Page header, aligned with title or breadcrumbs
      Variant: `icon-only` for compact display
      Verify: Copy button visible at top of detail page

- [x] T025 Add CopyPromptButton to detail page bottom (secondary position)
      File: `app/prompts/[id]/page.tsx`
      Location: Below prompt content, in action section
      Variant: `with-label` for clear call-to-action
      Verify: Copy button visible at bottom of detail page

- [x] T026 Update existing Prompt type definition to include copy tracking fields from API response
      File: `lib/types/prompt.ts` (or existing types location)
      Fields: Add `copy_count?: number`, `last_copied_at?: string | null` to interface
      Verify: TypeScript compiles without errors, fields optional

- [x] T027 Display copy metrics (copy_count, last_copied_at) on detail page
      File: `app/prompts/[id]/page.tsx`
      UI: Show "已复制 X 次，最后复制于 [时间]" if copy_count > 0
      Verify: Metrics displayed on detail page, formatted in Chinese

- [x] T028 Update detail page API call to include copy tracking fields
      File: `app/prompts/[id]/page.tsx`
      Query: Add `copy_count`, `last_copied_at` to SELECT fields
      Verify: API response includes tracking data

- [x] T029 Add loading state handling while fetching prompt with copy metrics
      File: `app/prompts/[id]/page.tsx`
      State: Show skeleton or spinner while fetching prompt data
      Verify: Loading indicator visible during data fetch

- [x] T030 Implement error handling for detail page API failures
      File: `app/prompts/[id]/page.tsx`
      UI: Error message when prompt fetch fails, retry option
      Verify: Error state displayed when API fails

- [x] T031 Add responsive layout for detail page copy buttons (mobile)
      File: `app/prompts/[id]/page.tsx`
      Layout: Top button on desktop, both top and bottom accessible on mobile
      Verify: Buttons accessible on mobile devices, touch-friendly

- [x] T032 Add focus management for copy buttons after page load
      File: `app/prompts/[id]/page.tsx`
      Logic: Set focus to page title or main content on mount
      Verify: Focus starts at appropriate element for keyboard navigation

- [x] T033 Implement aria-live region for success/error Toast announcements
      File: `app/prompts/[id]/page.tsx`
      Attribute: `aria-live="polite"` on Toast container
      Verify: Screen readers announce Toast messages

- [x] T034 Add copy button state management for detail page (copied vs default)
      File: `app/prompts/[id]/page.tsx`
      State: Track `copied: boolean` per button (separate state for top and bottom)
      Verify: Each button maintains independent copied state

---

## Phase 5: Polish & Cross-Cutting Concerns

**Goal**: 确保功能完整性、可访问性和测试覆盖率

**Independent Test Criteria**:

- [ ] 所有单元测试通过（`pnpm test:unit`）
- [ ] 所有 E2E 测试通过（`pnpm test:e2e`）
- [ ] 代码质量检查通过（`pnpm lint` 和 `pnpm check-types`）
- [ ] 功能在目标浏览器中 95%+ 可用

### Testing Tasks

- [x] T035 Write E2E tests for form page copy button using Playwright
      File: `tests/e2e/prompt-form-copy.spec.ts`
      Scenarios: Form fill, copy button click, clipboard verification, Toast display
      Browsers: Chrome, Firefox, Safari (mobile + desktop)
      Verify: All E2E tests pass, clipboard content verified

- [x] T036 Write E2E tests for detail page copy button
      File: `tests/e2e/prompt-detail-copy.spec.ts`
      Scenarios: Detail page load, copy from top and bottom buttons, metrics display
      Verify: All E2E tests pass, copy tracking API called

- [x] T037 Write unit tests for clipboard utility functions
      File: `tests/unit/lib/clipboard.test.ts`
      Tests: `formatPromptForCopy`, `copyToClipboard`, error handling, empty field filtering
      Verify: All unit tests pass, edge cases covered

### Documentation Tasks

- [x] T038 Update README.md with copy button feature documentation
      File: `README.md`
      Content: Feature description, usage examples, browser compatibility notes
      Verify: README includes copy button section

- [x] T039 Update quickstart.md with any implementation notes or lessons learned
      File: `specs/002-prompt-paste-button/quickstart.md`
      Add notes: Implementation gotchas, troubleshooting tips, optimization opportunities
      Verify: Quickstart reflects actual implementation experience

- [x] T040 Create example usage documentation for CopyPromptButton component
      File: `components/prompt/CopyPromptButton.md` or inline comments
      Content: Props interface, usage examples, accessibility notes
      Verify: Component has usage documentation

### Code Quality Tasks

- [x] T041 Run ESLint and fix all reported issues
      Command: `pnpm lint`
      Fix: Address accessibility, React hooks, TypeScript errors
      Verify: `pnpm lint` exits with no errors

- [x] T042 Run TypeScript type checker and fix all type errors
      Command: `pnpm check-types`
      Fix: Resolve type mismatches, missing types, implicit any
      Verify: `pnpm check-types` completes successfully

- [x] T043 Run Prettier formatter on all files to ensure consistent code style
      Command: `pnpm format`
      Scope: All modified files in this feature
      Verify: Code formatted consistently, no Prettier warnings

---

## Execution Strategy

### MVP Scope (Phase 1-3)

**Minimum Viable Product**: 实现 User Story 1（表单页面复制按钮），包括：

- Clipboard 工具函数（copyToClipboard, formatPromptForCopy）
- CopyPromptButton 组件（icon + label variants）
- 表单页面集成
- 键盘无障碍（ARIA 属性）
- API 端点（POST /api/prompts/:id/copy）
- 基础错误处理（空字段、权限拒绝）

**Estimated Tasks**: T001-T023 (23 tasks)
**Estimated Time**: 2-3 sprints (1-1.5 weeks)

### Incremental Delivery (Phase 4)

**Story 2 Enhancement**: 添加详情页面复制按钮：

- 顶部和底部复制按钮位置
- 显示复制指标（copy_count, last_copied_at）
- 响应式布局（移动端友好）
- 独立按钮状态管理

**Estimated Tasks**: T024-T034 (11 tasks)
**Estimated Time**: 1 sprint (3-5 days)

### Polish (Phase 5)

**Production Readiness**: 测试、文档、代码质量

- E2E 测试覆盖（Playwright）
- 单元测试覆盖（Vitest）
- 文档完善（README, quickstart）
- 代码质量（ESLint, TypeScript, Prettier）

**Estimated Tasks**: T035-T043 (9 tasks)
**Estimated Time**: 0.5 sprint (2-3 days)

---

## Parallel Execution Opportunities

### Maximum Parallelization (Optimal Workflow)

**Week 1: Setup + Foundational (Parallel Streams)**

```bash
# Stream 1: Project Setup
T001 - Install clipboard.js
T002 - Update types
T003 - Create directories
T004 - ESLint config

# Stream 2: Data Layer (can overlap with Stream 1 after T002)
T005 - Prisma schema
T006 - Create index
T007 - Generate migration
T008 - Apply migration
T009 - Regenerate client

# Stream 3: Contract Tests (can overlap with Stream 2 after T009)
T010 - Contract test
T011 - API route
T012 - Error handling
```

**Week 2: User Story 1 (Parallel Work)**

```bash
# Stream 1: Clipboard Utilities (after T012)
T013 - copyToClipboard function
T014 - formatPromptForCopy function

# Stream 2: Component Development (can start after T013)
T015 - CopyPromptButton component
T016 - Loading state
T017 - Success Toast
T018 - Error handling
T019 - Keyboard accessibility
T020 - Empty field validation
T021 - Form page integration

# Stream 3: API Integration (can start after T014)
T022 - Tracking API call
T023 - Debounce mechanism
```

**Week 3: User Story 2 + Polish**

```bash
# Stream 1: Detail Page (after T023)
T024 - Top copy button
T025 - Bottom copy button
T026 - Type definitions
T027 - Display metrics
T028 - API call update
T029 - Loading state
T030 - Error handling
T031 - Responsive layout
T032 - Focus management
T033 - ARIA announcements
T034 - State management

# Stream 2: Testing (can start after T034)
T035 - E2E tests
T036 - Detail page E2E
T037 - Unit tests

# Stream 3: Documentation (parallel with testing)
T038 - README update
T039 - Quickstart update
T040 - Component docs
T041 - ESLint
T042 - TypeScript check
T043 - Prettier
```

**Total Estimated Time with Parallelization**: 2-3 weeks (vs 4-5 weeks sequential)

---

## MVP Success Criteria

**Phase 1-3 Completion Checklist**:

- [ ] Clipboard utilities implemented and tested (T013-T014)
- [ ] CopyPromptButton component created with all variants (T015-T021)
- [ ] Form page copy button integrated and functional (T021)
- [ ] API endpoint returns correct copy tracking response (T011-T012)
- [ ] Keyboard navigation works (Tab + Enter/Space) (T019)
- [ ] Empty field validation prevents invalid copies (T020)
- [ ] Copy operation completes in <100ms (measured manually) (all)
- [ ] Browser compatibility tested (Chrome, Firefox, Safari) (manual)
- [ ] E2E tests pass for form page copy flow (T035)

**MVP Verdict**: ✅ Ready for demo and user testing

---

## Full Feature Completion

**All 5 Phases Complete When**:

- [ ] Form page copy button working (Phase 3)
- [ ] Detail page copy buttons working (Phase 4)
- [ ] All unit tests passing (T037)
- [ ] All E2E tests passing (T035-T036)
- [ ] Code quality checks pass (T041-T043)
- [ ] Documentation updated (T038-T040)
- [ ] Browser compatibility ≥95% verified (manual testing)
- [ ] Performance goals met (<100ms copy, 95% browser support)

---

## Dependencies

**External Dependencies**:

- clipboard.js@^2.0.11 (MIT license, 3KB gzipped)
- @types/clipboard (TypeScript definitions)

**Internal Dependencies**:

- Feature 001 (Prompt Builder MVP) must be complete
- Prisma Client with Prompt model
- Next.js API routes framework

**Blocked By**:

- None (unblocked start)

**Blocking**:

- Feature 003+ (if depends on copy metrics analysis)

---

## Notes

**Task Estimates**: Each task estimated 0.5-2 hours depending on complexity

**Next.js App Router Structure (without src directory)**:

- All paths are at repository root: `app/`, `components/`, `lib/`, `prisma/`, `tests/`
- API routes use `app/api/` folder structure
- Pages use `app/` folder with file-based routing
- **Types are in `lib/types/` (existing location, do not create `types/` directory)**

**Definition of Done for Each Task**:

- [ ] Code implemented in specified file
- [ ] Code follows project style guide (ESLint passes)
- [ ] Manual testing confirms basic functionality
- [ ] Task marked complete in this checklist

**Risk Mitigation**:

- Clipboard API permissions: Test in multiple browsers early (T013)
- Race conditions in copy_count: Use Prisma atomic increment (T011)
- Browser compatibility: Test fallback to execCommand on old browsers (T013)
- Concurrent API calls: Implement debounce on button (T023)

---

**Generated by**: `/speckit.tasks` command
**Template Version**: tasks-template.md
**Date**: 2026-02-12
**Ready for Implementation**: Yes ✅
