# Research: Prompt Paste Button

**Feature**: 002-prompt-paste-button
**Date**: 2026-02-12
**Phase**: Phase 0 - Research & Technology Decisions

## Overview

本文档记录提示词粘贴按钮功能的技术研究和决策，解决 Technical Context 中的关键技术问题。

---

## 1. Clipboard 实现方案

### Decision: 使用 clipboard.js 库 + 原生 Clipboard API

**Rationale**:

- clipboard.js 提供统一的接口，自动处理 Clipboard API (现代浏览器) 和 document.execCommand('copy') (旧浏览器) 的降级
- 社区活跃，体积小（~3KB gzipped），无外部依赖
- 自动处理用户手势要求，无需手动实现事件绑定
- 广泛使用于生产环境，兼容性经过验证

**Alternatives Considered**:

1. **仅使用原生 Clipboard API**
   - 优点：零依赖，体积最小
   - 缺点：仅支持现代浏览器（2016+），旧浏览器需要手动实现降级方案
   - 结论：不符合 95% 浏览器兼容性要求（SC-002）

2. **仅使用 document.execCommand('copy')**
   - 优点：兼容性最好（IE9+）
   - 缺点：已废弃 API，未来可能被移除；需要手动选择文本和执行命令
   - 结论：技术债务高，不符合长期维护性

3. **navigator.clipboard + 手动降级**
   - 优点：完全控制实现细节
   - 缺点：需要手动处理各种边界情况（HTTPS、用户手势、权限）
   - 结论：重复造轮，维护成本高

**Implementation Notes**:

```typescript
// clipboard.js 用法示例
import Clipboard from 'clipboard';

// 初始化（支持按钮选择器或元素实例）
const clipboard = new Clipboard('.copy-button');

clipboard.on('success', (e) => {
  // 显示 Toast 反馈
  showToast('已复制到剪贴板');
  // 追踪复制操作
  trackCopy(e.trigger.dataset.promptId);
});

clipboard.on('error', (e) => {
  // 显示错误提示和手动复制指南
  showError('复制失败，请手动复制');
});
```

---

## 2. 键盘无障碍实现

### Decision: 使用原生 HTML button 元素 + ARIA 属性

**Rationale**:

- 原生 `<button>` 元素天然支持键盘导航（Tab）和激活（Enter/Space）
- 符合 WCAG 2.1 AA 标准（FR-002b）
- 无需额外 JavaScript 处理键盘事件
- 屏幕阅读器自动识别为可交互元素

**Alternatives Considered**:

1. **自定义 div + 键盘事件监听**
   - 优点：样式完全自定义
   - 缺点：需要手动实现 Tab 导航、Enter/Space 处理、焦点样式
   - 结论：维护成本高，容易遗漏边界情况

2. **Radix UI Button 组件**
   - 优点：内置无障碍支持，与现有 tech stack 一致（shadcn/ui 基于 Radix）
   - 缺点：依赖较重的组件库
   - 结论：可行但过度设计，原生 button 已足够

**Implementation Notes**:

```tsx
// 符合 WCAG 2.1 AA 的按钮实现
<button
  className="copy-button"
  data-prompt-id={promptId}
  aria-label="复制提示词到剪贴板"
  type="button"
>
  <CopyIcon aria-hidden="true" />
  复制
</button>

// 焦点样式（Tailwind）
.focus-visible:focus {
  outline: 2px solid blue-500;
  outline-offset: 2px;
}
```

**Testing Checklist**:

- [ ] Tab 键可聚焦到按钮
- [ ] Enter 键触发复制
- [ ] Space 键触发复制
- [ ] 屏幕阅读器读出 "复制提示词到剪贴板"
- [ ] 焦点指示器清晰可见
- [ ] 鼠标点击正常工作

---

## 3. 匿名使用追踪实现

### Decision: 后端 API 追踪 + Prisma 计数器更新

**Rationale**:

- 追踪在后端 API 实现，避免客户端伪造数据
- Prisma 的 `increment` 原子操作确保并发安全
- 不存储用户标识（IP、session），完全匿名
- 与现有 Prompt 模型无缝集成

**Alternatives Considered**:

1. **前端 localStorage 追踪**
   - 优点：无后端开销，立即更新 UI
   - 缺点：无法跨设备同步，用户可清除，数据不可信
   - 结论：不符合使用分析需求

2. **Google Analytics / 第三方工具**
   - 优点：强大的分析功能
   - 缺点：引入外部依赖，隐私合规问题
   - 结论：过度设计，简单计数即可

3. **完全追踪（用户 ID + 时间戳）**
   - 优点：详细的用户行为分析
   - 缺点：违反隐私原则，需要用户认证
   - 结论：不符合匿名追踪要求（FR-012）

**Implementation Notes**:

```typescript
// API route: POST /api/prompts/:id/copy
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const promptId = params.id;

  // 原子性更新计数器（并发安全）
  const prompt = await prisma.prompt.update({
    where: { id: promptId },
    data: {
      copy_count: { increment: 1 },
      last_copied_at: new Date().toISOString(),
    },
  });

  return Response.json({ success: true, copy_count: prompt.copy_count });
}

// 前端调用（在复制成功后）
async function trackCopy(promptId: string) {
  try {
    await fetch(`/api/prompts/${promptId}/copy`, { method: 'POST' });
  } catch (error) {
    // 追踪失败不影响用户体验
    console.warn('Failed to track copy:', error);
  }
}
```

**Performance Consideration**:

- 追踪 API 调用异步执行，不阻塞复制操作
- 追踪失败时静默降级，用户无感知（Edge Case 已覆盖）
- Prisma `increment` 操作高效，单次 <50ms

---

## 4. 浏览器兼容性策略

### Decision: Feature detection + Progressive enhancement

**Rationale**:

- clipboard.js 内置 feature detection，自动选择最佳方法
- 降级方案覆盖 99%+ 浏览器（IE9+, Chrome 41+, Firefox 41+, Safari 10+）
- 不支持的浏览器显示友好错误和手动复制指南（FR-008）

**Browser Support Matrix**:

| Browser | Version | Primary Method       | Fallback    | Expected Support |
| ------- | ------- | -------------------- | ----------- | ---------------- |
| Chrome  | 41+     | document.execCommand | N/A         | ✅ 100%          |
| Firefox | 41+     | document.execCommand | N/A         | ✅ 100%          |
| Safari  | 10+     | document.execCommand | N/A         | ✅ 100%          |
| Edge    | All     | document.execCommand | N/A         | ✅ 100%          |
| IE      | 9+      | document.execCommand | N/A         | ✅ 100%          |
| Chrome  | 66+     | Clipboard API        | execCommand | ✅ 100%          |
| Safari  | 13.1+   | Clipboard API        | execCommand | ✅ 100%          |
| Firefox | 63+     | Clipboard API        | execCommand | ✅ 100%          |

**Implementation Notes**:

```typescript
// Feature detection (clipboard.js 内置处理，无需手动实现)
if (navigator.clipboard && window.isSecureContext) {
  // 使用现代 Clipboard API
} else if (document.queryCommandSupported('copy')) {
  // 降级到 execCommand
} else {
  // 完全不支持，显示错误
  showManualCopyInstructions();
}
```

---

## 5. 提示词格式化规范

### Decision: 使用英文标签 + 纯文本格式

**Rationale**:

- 英文标签（lyrics、style、vocal、instrumental）与 AI 音乐工具参数命名一致
- 纯文本格式兼容所有 AI 工具，粘贴成功率 ≥98%（SC-004）
- 格式清晰易读，字段标题加冒号分隔

**Format Specification**:

```
lyrics:
[Verse]
这里是歌词内容...

style:
Pop 活泼欢快，BPM 120，适合短视频背景音乐

vocal:
女声，甜美清亮，主唱风格

instrumental:
钢琴主导，辅以轻快的鼓点和合成器
```

**Rules**:

- 只包含已填写的字段（FR-005）
- 字段按固定顺序：lyrics → style → vocal → instrumental
- 字段标签使用小写英文，后跟冒号和换行
- 字段内容保留原始格式（包括换行、标点）

**Implementation**:

```typescript
function formatPromptForCopy(prompt: Prompt): string {
  const fields = [];

  if (prompt.lyrics) fields.push(`lyrics:\n${prompt.lyrics}`);
  if (prompt.style) fields.push(`style:\n${prompt.style}`);
  if (prompt.vocal) fields.push(`vocal:\n${prompt.vocal}`);
  if (prompt.instrumental) fields.push(`instrumental:\n${prompt.instrumental}`);

  return fields.join('\n\n');
}
```

---

## 6. E2E 测试剪贴板验证策略

### Decision: Playwright + clipboard API mocking

**Rationale**:

- Playwright 支持模拟剪贴板操作，无需真实复制到系统剪贴板
- 可验证复制内容格式、API 调用、UI 反馈
- 测试稳定，不依赖系统权限

**Implementation Example**:

```typescript
// e2e/prompt-form-copy.spec.ts
test('should copy formatted prompt to clipboard', async ({ page }) => {
  // 填写表单
  await page.fill('[name="lyrics"]', '[Verse]\nTest lyrics');
  await page.fill('[name="style"]', 'Pop style');

  // 模拟 clipboard API
  await page.evaluate(() => {
    // Mock clipboard.writeText
  });

  // 点击复制按钮
  await page.click('button[aria-label="复制提示词到剪贴板"]');

  // 验证复制内容
  const clipboardText = await page.evaluate(() =>
    // 返回模拟的剪贴板内容
  );

  expect(clipboardText).toContain('lyrics:');
  expect(clipboardText).toContain('style:');

  // 验证 Toast 显示
  await expect(page.locator('text=已复制到剪贴板')).toBeVisible();
});
```

---

## Summary of Decisions

| Decision       | Technology                 | Justification                             |
| -------------- | -------------------------- | ----------------------------------------- |
| Clipboard 实现 | clipboard.js 库            | 自动降级，95%+ 浏览器兼容性               |
| 键盘无障碍     | 原生 button + ARIA         | 符合 WCAG 2.1 AA，零额外成本              |
| 使用追踪       | 后端 API + Prisma 原子计数 | 匿名、并发安全、可信数据                  |
| 浏览器兼容     | Feature detection          | Progressive enhancement，覆盖 99%+ 浏览器 |
| 格式化规范     | 英文标签 + 纯文本          | 与 AI 工具兼容，98%+ 粘贴成功率           |
| E2E 测试       | Playwright + mocking       | 稳定测试，不依赖系统权限                  |

---

## Next Steps (Phase 1)

基于研究结果，Phase 1 将生成：

1. **data-model.md** - 扩展 Prisma Prompt 模型（copy_count, last_copied_at）
2. **contracts/** - API 端点规范（POST /api/prompts/:id/copy）
3. **quickstart.md** - 开发者快速启动指南

所有 Technical Context 中的 NEEDS CLARIFICATION 已解决。
