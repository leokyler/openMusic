# Quickstart: Prompt Paste Button

**Feature**: 002-prompt-paste-button
**Date**: 2026-02-12
**Purpose**: 快速开始提示词粘贴按钮功能的开发

---

## Prerequisites

- ✅ Node.js 18+ 和 pnpm 10.19.0+
- ✅ PostgreSQL 14+ 数据库运行中
- ✅ Feature 001 (Prompt Builder MVP) 已实现并运行
- ✅ 基础开发环境配置完成（ESLint、Prettier、TypeScript）

---

## 1. 安装依赖

```bash
# 安装剪贴板库（已使用 clipboard.js）
pnpm add clipboard @types/clipboard

# 或选择现代替代方案（如需要）
# pnpm add @vueuse/core  # Vue 3 项目
# pnpm add react-clipboard-copy  # React 项目
```

**Note**: clipboard.js 是纯 JavaScript 库，无框架依赖，可在任何项目中使用。

---

## 2. 数据库迁移

### 2.1 更新 Prisma Schema

**File**: `prisma/schema.prisma`

```prisma
model Prompt {
  id            String    @id @default(cuid())
  lyrics        String?
  style         String?
  vocal         String?
  instrumental  String?
  version       String    @default("1.0.0")
  quality_score  String    @default("low")

  // NEW: Copy tracking fields
  copy_count     Int       @default(0)
  last_copied_at DateTime?

  created_at     DateTime   @default(now())
  updated_at     DateTime   @updatedAt

  outputs       Output[]
}
```

### 2.2 生成并运行迁移

```bash
# 创建迁移文件
pnpm prisma migrate dev --name add_copy_tracking

# 应用迁移到数据库
pnpm prisma migrate deploy

# 重新生成 Prisma Client
pnpm prisma generate
```

### 2.3 验证迁移

```bash
# 使用 Prisma Studio 检查新字段
pnpm prisma studio

# 或使用 psql
psql -d openmusic -c "\d prompts;"
```

**Expected Output**:

- ✅ `copy_count` 列存在，默认值 0
- ✅ `last_copied_at` 列存在，可为 NULL
- ✅ 索引 `Prompt_copy_count_idx` 已创建

---

## 3. 实现 Clipboard 工具函数

### 3.1 创建剪贴板工具

**File**: `src/lib/clipboard.ts`

```typescript
import Clipboard from 'clipboard';

export interface ClipboardOptions {
  onSuccess?: (text: string) => void;
  onError?: (error: Error) => void;
}

/**
 * 复制文本到剪贴板，使用 clipboard.js 库
 * 自动降级到 document.execCommand 以支持旧浏览器
 *
 * @param text - 要复制的文本内容
 * @param element - 触发复制的 DOM 元素（可选）
 * @returns Clipboard 实例（用于事件监听）
 */
export function copyToClipboard(text: string, options: ClipboardOptions = {}): Clipboard | null {
  try {
    // 创建临时 text area 用于降级方案
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);

    // 初始化 clipboard.js
    const clipboard = new Clipboard(textarea, {
      text: () => text,

      // 成功回调
      action: () => {
        options.onSuccess?.(text);
        document.body.removeChild(textarea);
      },
    });
  } catch (error) {
    options.onError?.(error as Error);
    return null;
  }

  return clipboard;
}

/**
 * 格式化提示词为剪贴板文本
 * 只包含已填写的字段，使用英文标签
 */
export function formatPromptForCopy(prompt: Partial<Prompt>): string {
  const fields: string[] = [];

  if (prompt.lyrics) {
    fields.push(`lyrics:\n${prompt.lyrics}`);
  }
  if (prompt.style) {
    fields.push(`style:\n${prompt.style}`);
  }
  if (prompt.vocal) {
    fields.push(`vocal:\n${prompt.vocal}`);
  }
  if (prompt.instrumental) {
    fields.push(`instrumental:\n${prompt.instrumental}`);
  }

  return fields.join('\n\n');
}
```

### 3.2 测试剪贴板工具

```bash
# 运行单元测试
pnpm test:unit tests/unit/lib/clipboard.test.ts
```

---

## 4. 创建复制按钮组件

### 4.1 实现按钮组件

**File**: `src/components/prompt/CopyPromptButton.tsx`

```tsx
'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard, formatPromptForCopy } from '@/lib/clipboard';

interface CopyPromptButtonProps {
  prompt: Partial<Prompt>;
  variant?: 'icon-only' | 'with-label';
  className?: string;
}

export function CopyPromptButton({
  prompt,
  variant = 'icon-only',
  className = '',
}: CopyPromptButtonProps) {
  const [copied, setCopied] = useState(false);
  const [tracking, setTracking] = useState(false);

  const handleClick = () => {
    // 验证至少有一个字段已填写
    if (!prompt.lyrics && !prompt.style && !prompt.vocal && !prompt.instrumental) {
      showErrorToast('请先填写提示词内容');
      return;
    }

    // 格式化提示词文本
    const formattedText = formatPromptForCopy(prompt);

    // 复制到剪贴板
    const clipboard = copyToClipboard(formattedText, {
      onSuccess: async () => {
        setCopied(true);
        showSuccessToast('已复制到剪贴板');

        // 异步追踪（不阻塞）
        trackCopy(prompt.id!);
      },
      onError: (error) => {
        console.error('Copy failed:', error);
        showErrorToast('复制失败，请手动复制');
      },
    });

    // 2 秒后重置图标状态
    setTimeout(() => setCopied(false), 2000);
  };

  // 检查是否至少有一个字段
  const hasContent = prompt.lyrics || prompt.style || prompt.vocal || prompt.instrumental;

  return (
    <button
      onClick={handleClick}
      disabled={!hasContent || tracking}
      aria-label="复制提示词到剪贴板"
      type="button"
      className={clsx(
        'inline-flex items-center gap-2 rounded-md px-3 py-2',
        'transition-colors focus-visible:outline-2 focus-visible:outline-blue-500',
        'hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" aria-hidden="true" />
          {variant === 'with-label' && <span>已复制</span>}
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" aria-hidden="true" />
          {variant === 'with-label' && <span>复制</span>}
        </>
      )}
    </button>
  );
}

// 追踪函数（异步调用）
async function trackCopy(promptId: string) {
  try {
    await fetch(`/api/prompts/${promptId}/copy`, {
      method: 'POST',
    });
  } catch (error) {
    // 静默失败，不影响用户体验
    console.warn('Failed to track copy:', error);
  }
}
```

### 4.2 添加到表单页面

**File**: `src/app/prompts/new/page.tsx`

```tsx
import { CopyPromptButton } from '@/components/prompt/CopyPromptButton';

export default function NewPromptPage() {
  const [prompt, setPrompt] = useState<Partial<Prompt>>({});

  return (
    <div>
      {/* 现有表单字段 ... */}

      {/* NEW: 添加复制按钮到表单底部 */}
      <div className="mt-6 flex justify-end">
        <CopyPromptButton prompt={prompt} variant="with-label" />
      </div>
    </div>
  );
}
```

### 4.3 添加到详情页面

**File**: `src/app/prompts/[id]/page.tsx`

```tsx
import { CopyPromptButton } from '@/components/prompt/CopyPromptButton';

export default function PromptDetailPage({ params }: { params: { id: string } }) {
  const prompt = await getPrompt(params.id);

  return (
    <div>
      {/* 现有详情显示 ... */}

      {/* NEW: 添加复制按钮到页面顶部和底部 */}
      <div className="flex justify-between items-center mb-4">
        <h1>提示词详情</h1>
        <CopyPromptButton prompt={prompt} variant="icon-only" />
      </div>

      {/* 内容 ... */}

      <div className="mt-6 flex justify-end">
        <CopyPromptButton prompt={prompt} variant="with-label" />
      </div>
    </div>
  );
}
```

---

## 5. 实现 API 端点

### 5.1 创建复制追踪路由

**File**: `src/app/api/prompts/[id]/copy/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const promptId = params.id;

    // 验证提示词存在
    const existing = await prisma.prompt.findUnique({
      where: { id: promptId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Prompt not found', details: `No prompt exists with ID: ${promptId}` },
        { status: 404 }
      );
    }

    // 原子性更新复制计数（并发安全）
    const updated = await prisma.prompt.update({
      where: { id: promptId },
      data: {
        copy_count: { increment: 1 },
        last_copied_at: new Date(),
      },
      select: {
        copy_count: true,
        last_copied_at: true,
      },
    });

    return NextResponse.json({
      success: true,
      copy_count: updated.copy_count,
      last_copied_at: updated.last_copied_at?.toISOString() ?? null,
    });
  } catch (error) {
    console.error('Copy tracking error:', error);

    return NextResponse.json(
      { error: 'Internal server error', details: 'Failed to update copy tracking metrics' },
      { status: 500 }
    );
  }
}
```

---

## 6. 本地测试

### 6.1 启动开发服务器

```bash
# 启动 Next.js 开发服务器
pnpm dev

# 访问 http://localhost:3000
```

### 6.2 手动测试清单

- [ ] **表单页面**：
  - [ ] 填写完整提示词，点击"复制"按钮
  - [ ] 验证剪贴板内容格式正确（英文标签）
  - [ ] 验证 Toast 提示"已复制到剪贴板"
  - [ ] 检查数据库 `copy_count` 增加 1
  - [ ] 检查数据库 `last_copied_at` 更新

- [ ] **详情页面**：
  - [ ] 访问已保存的提示词
  - [ ] 点击顶部和底部的复制按钮
  - [ ] 验证复制内容包含所有字段
  - [ ] 检查复制次数正确递增

- [ ] **边界情况**：
  - [ ] 尝试复制空提示词（应显示错误）
  - [ ] 快速连续点击复制按钮（应防抖）
  - [ ] 使用 Tab 键导航到按钮，按 Enter 触发复制

- [ ] **浏览器兼容**：
  - [ ] Chrome/Edge (Clipboard API)
  - [ ] Firefox (Clipboard API)
  - [ ] Safari (execCommand fallback)
  - [ ] 移动浏览器（触摸交互）

### 6.3 单元测试

```bash
# 运行所有单元测试
pnpm test:unit

# 运行特定测试文件
pnpm test:unit tests/unit/lib/clipboard.test.ts
pnpm test:unit tests/unit/components/CopyPromptButton.test.ts
```

### 6.4 E2E 测试

```bash
# 运行 Playwright E2E 测试
pnpm test:e2e

# 运行特定测试文件
pnpm playwright test tests/e2e/prompt-form-copy.spec.ts
pnpm playwright test tests/e2e/prompt-detail-copy.spec.ts
```

---

## 7. 验证成功标准

### Performance

- [ ] 复制操作在 100ms 内完成（SC-001）
- [ ] 列表页加载 <1s（100 条记录）（SC-003）

### Browser Compatibility

- [ ] 主流浏览器最新版本 100% 可用（SC-002）
- [ ] 旧浏览器（2016 前）通过降级方案可用

### User Discovery

- [ ] 复制按钮在表单页和详情页显眼位置（SC-003）
- [ ] 按钮标签清晰（"复制"或图标）

### Success Rate

- [ ] 复制的文本格式在目标 AI 工具中 98%+ 成功粘贴（SC-004）

---

## 8. 常见问题

### Q: 复制按钮不工作？

**A**: 检查浏览器控制台错误：

1. 验证 HTTPS 环境（Clipboard API 要求安全上下文）
2. 检查浏览器权限（隐私设置可能阻止剪贴板访问）
3. 尝试手动复制并报告问题

### Q: 复制次数没有更新？

**A**: 检查网络请求：

1. 打开浏览器开发者工具 → Network 标签
2. 查找 `/api/prompts/:id/copy` 请求
3. 验证响应状态码 200
4. 检查服务器日志是否有错误

### Q: 如何测试键盘无障碍？

**A**: 使用屏幕阅读器或键盘：

1. 按 Tab 键导航到复制按钮
2. 验证焦点指示器（蓝色轮廓）可见
3. 按 Enter 或 Space 键触发复制
4. 使用屏幕阅读器验证 "复制提示词到剪贴板" 被读出

---

## 9. 下一步

完成本 quickstart 后，你应该：

1. ✅ 数据库迁移已完成
2. ✅ Clipboard 工具函数实现并测试
3. ✅ 复制按钮组件在两个页面集成
4. ✅ API 端点实现并返回正确响应
5. ✅ 本地测试通过（手动 + 自动化）

**准备提交代码**：

```bash
# 运行类型检查
pnpm check-types

# 运行 lint
pnpm lint

# 运行所有测试
pnpm test

# 提交更改
git add .
git commit -m "feat: add prompt copy button with tracking (feature 002)"
git push origin 002-prompt-paste-button
```

**参考文档**:

- [Data Model](./data-model.md) - 完整的数据模型定义
- [API Contract](./contracts/prompt-copy.openapi.yaml) - OpenAPI 规范
- [Research](./research.md) - 技术决策和原理

---

**Happy Coding! 🚀**
