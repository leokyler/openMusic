# Feature Specification: Prompt Paste Button

**Feature Branch**: `002-prompt-paste-button`
**Created**: 2026-02-12
**Status**: Draft
**Input**: User description: "添加提示词粘贴按钮在提示词表单页和详情页，从而让用户可以直接粘贴到ai 音乐工具上 。注意，当前已经有了一个spec @specs/001-prompt-builder-mvp/ 注意序号"

## Clarifications

### Session 2026-02-12

- Q: Should the copy button support keyboard accessibility? → A: Copy button must be keyboard accessible (Tab navigation + Enter/Space to activate), following WCAG 2.1 AA standards
- Q: Should copy actions be tracked for analytics? → A: Track basic anonymous metrics: copy count per prompt, total copies, last copied timestamp
- Q: What clipboard fallback strategy for older browsers? → A: Use document.execCommand('copy') as fallback for older browsers, triggered by a user-initiated event

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Paste from Form Page (Priority: P1)

用户在创建或编辑提示词时，可以通过点击粘贴按钮快速将提示词内容复制到剪贴板，以便直接粘贴到 AI 音乐生成工具中使用。

**Why this priority**: 这是核心功能，直接提升用户体验。用户频繁需要将提示词复制到外部 AI 工具，一键复制按钮大幅提高操作效率。

**Independent Test**: 用户访问提示词创建页面，填写提示词内容，点击"复制"按钮，然后粘贴到外部应用验证复制成功。可以通过 UI 操作独立测试，无需依赖其他功能。

**Acceptance Scenarios**:

1. **Given** 用户在提示词表单页面填写了完整的提示词内容（包括 lyrics、style、vocal、instrumental）, **When** 用户点击"复制提示词"按钮, **Then** 系统将格式化后的提示词文本复制到剪贴板，显示"复制成功"的反馈提示
2. **Given** 用户在提示词表单页面填写了部分内容（只有 lyrics 和 style）, **When** 用户点击"复制提示词"按钮, **Then** 系统只复制已填写的字段，忽略空字段
3. **Given** 用户使用键盘访问表单页面, **When** 用户通过 Tab 键导航到"复制提示词"按钮并按下 Enter 或 Space 键, **Then** 系统执行复制操作并显示成功提示
4. **Given** 用户点击"复制提示词"按钮后, **When** 用户在 AI 音乐工具的输入框中粘贴, **Then** 粘贴的内容格式正确，包含所有已填写的提示词字段
5. **Given** 浏览器不支持剪贴板访问权限, **When** 用户点击"复制提示词"按钮, **Then** 系统显示友好的错误提示，说明当前环境不支持自动复制，并提供手动复制的备用方案

---

### User Story 2 - Paste from Detail Page (Priority: P2)

用户在查看已保存的提示词详情时，可以通过点击粘贴按钮快速复制提示词内容，以便在 AI 音乐生成工具中重复使用该提示词。

**Why this priority**: 这是重用场景的核心功能。用户经常需要重复使用已保存的高质量提示词，详情页的复制按钮提供便捷的访问路径。

**Independent Test**: 用户访问提示词列表，点击某个提示词查看详情，在详情页点击"复制提示词"按钮，然后粘贴到外部应用验证复制成功。可以通过准备测试数据独立测试。

**Acceptance Scenarios**:

1. **Given** 用户查看某个已保存的提示词详情, **When** 用户点击详情页的"复制提示词"按钮, **Then** 系统将完整的提示词文本复制到剪贴板，显示"复制成功"的反馈提示
2. **Given** 提示词包含所有四个字段（lyrics、style、vocal、instrumental）, **When** 用户点击复制, **Then** 复制的内容包含所有字段，格式清晰易读
3. **Given** 提示词只包含部分字段, **When** 用户点击复制, **Then** 复制的内容只包含存在的字段，不显示空字段标签
4. **Given** 用户在移动设备上查看提示词详情, **When** 用户点击复制按钮, **Then** 系统在移动浏览器上正常工作，正确调用剪贴板 API

---

### Edge Cases

- 当用户在未填写任何内容时点击复制按钮，系统显示提示"请先填写提示词内容"
- 当用户在只读模式查看提示词时（非创建者），复制按钮仍然可用
- 当用户使用键盘（无鼠标）操作时，复制按钮必须可通过键盘焦点访问并激活
- 当浏览器不支持 Clipboard API 但支持 document.execCommand('copy') 时，系统使用降级方案，复制功能正常工作
- 当两种复制方法都不可用时（极少数情况），系统显示详细的错误说明和手动复制指南
- 当提示词内容非常长（lyrics > 3000字符），复制操作应在 100ms 内完成
- 当复制操作成功但追踪记录失败时，复制功能仍然成功，不影响用户体验，追踪失败仅记录到系统日志
- 当用户连续快速点击复制按钮，系统应该防止重复操作，只执行一次复制
- 当剪贴板权限被拒绝时（某些浏览器隐私设置），系统显示详细的错误说明和手动复制指南

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST 在提示词表单页面提供"复制提示词"按钮，位置在表单操作区显眼位置
- **FR-002**: System MUST 在提示词详情页面提供"复制提示词"按钮，位置在页面顶部或底部操作区
- **FR-002b**: System MUST 支持键盘访问复制按钮，可通过 Tab 键导航到按钮，使用 Enter 或 Space 键触发复制操作，符合 WCAG 2.1 AA 标准
- **FR-003**: System MUST 将提示词格式化为易读的文本格式，包含英文字段标签（如"lyrics:"、"style:"等）和对应内容
- **FR-004**: System MUST 在复制成功后显示视觉反馈（如 Toast 提示"已复制到剪贴板"），反馈在 2 秒后自动消失
- **FR-005**: System SHOULD 只复制已填写的字段，忽略空字段
- **FR-006**: System MUST 在复制前验证至少有一个字段已填写，否则显示错误提示
- **FR-007**: System MUST 使用浏览器 Clipboard API 实现复制功能，当 Clipboard API 不可用时，降级使用 document.execCommand('copy') 方法作为后备方案，确保在用户触发的事件（如点击、按键）中执行
- **FR-008**: System MUST 处理剪贴板权限被拒绝的情况，显示友好的错误消息和手动复制说明
- **FR-009**: System SHOULD 防止用户重复点击复制按钮导致重复操作，使用防抖机制或禁用按钮 500ms
- **FR-010**: System MUST 确保复制的文本格式兼容主流 AI 音乐生成工具（如 Minimax、Suno 等）
- **FR-011**: System MUST 记录复制操作的基本匿名指标，包括每个提示词的复制次数、总复制次数、最后复制时间戳
- **FR-012**: System SHOULD 将复制指标存储在提示词实体中，不关联用户身份信息（匿名追踪）

### Key Entities

此功能主要涉及 UI 交互，扩展现有 Prompt 实体以支持复制追踪。提示词格式化规则如下：

**Prompt 实体扩展属性**（追踪复制行为）:

- `copy_count`: 该提示词被复制的总次数（整数，默认 0）
- `last_copied_at`: 最后一次复制的时间戳（ISO 8601 格式，可为 null）

**提示词文本格式**（复制到剪贴板时的格式）:

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

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 用户点击复制按钮后，提示词在 100ms 内被复制到剪贴板
- **SC-002**: 复制功能在主流浏览器（Chrome、Firefox、Safari、Edge）的最新版本和旧版本（通过降级方案）上 95% 可用
- **SC-003**: 95% 的用户在首次使用时能够成功发现并使用复制按钮
- **SC-004**: 复制的提示词格式在目标 AI 音乐工具中的粘贴成功率 ≥ 98%
- **SC-005**: 复制按钮的视觉反馈（成功提示）在所有设备上清晰可见

## Assumptions

- 用户使用现代浏览器，支持 Clipboard API（2016 年后的浏览器版本），旧浏览器可通过降级方案支持
- 目标 AI 音乐工具接受纯文本格式的提示词输入
- 提示词内容中不包含敏感或私密信息（如个人身份信息）
- 用户主要在桌面设备上使用，但移动端也应该支持
- 剪贴板访问权限在大多数环境中默认允许

## Dependencies

- 依赖于 001-prompt-builder-mvp 功能，特别是提示词表单页面和详情页面的实现
- 需要前端框架支持剪贴板操作或使用专用的剪贴板库（如 clipboard.js），该库已内置 Clipboard API 和 document.execCommand('copy') 的降级处理

## Out of Scope (Not in MVP)

- 复制提示词的部分字段（如只复制 lyrics 或只复制 style）
- 自定义复制格式（如 JSON 格式、Markdown 格式等）
- 复制历史记录功能
- 批量复制多个提示词
- 将提示词直接发送到 AI 音乐生成工具的 API 集成
- 跨设备同步剪贴板内容
