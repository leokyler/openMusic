# Feature Specification: Structured Prompt Builder MVP

**Feature Branch**: `001-prompt-builder-mvp`  
**Created**: 2026-02-11  
**Status**: Draft  
**Input**: User description: "创建一个 MVP 系统，用于生成、验证和存储结构化的 AI 音乐提示词，基于 Minimax 音频生成模型的参数定义（lyrics, style, vocal, instrumental），并实现基本的输出追踪功能"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Create Structured Prompt (Priority: P1)

用户可以通过界面创建结构化的音乐生成提示词，系统自动验证提示词格式并保存。提示词包含歌词结构（带章节标签）、风格描述、人声参数和器乐配置。

**Why this priority**: 这是系统的核心功能，没有它就无法创建提示词。这是 MVP 的基础，必须首先实现。

**Independent Test**: 用户填写提示词表单，点击保存，系统验证并存储提示词，返回提示词 ID。可以通过 API 或 UI 独立测试，即使没有后续功能也能验证核心流程。

**Acceptance Scenarios**:

1. **Given** 用户访问提示词创建页面, **When** 用户填写歌词（带 [Verse]、[Chorus] 标签）和风格描述后点击保存, **Then** 系统验证提示词格式正确，保存到数据库，返回提示词 ID、质量评分（高）和成功消息
2. **Given** 用户填写了不完整的提示词（缺少推荐字段）, **When** 用户点击保存, **Then** 系统显示清晰的警告消息，指出缺少哪些推荐字段，但仍允许用户选择强制保存
3. **Given** 用户输入的歌词没有使用标准章节标签, **When** 用户点击保存, **Then** 系统显示警告提示建议使用章节标签（[Verse]、[Chorus] 等）以提高生成稳定性，显示质量评分（中/低），但允许用户继续保存
4. **Given** 用户看到结构不完整的警告, **When** 用户选择"仍然保存", **Then** 系统保存提示词并标记其质量评分为"低"或"中"，在列表中显示质量指示器

---

### User Story 2 - View and Retrieve Prompts (Priority: P2)

用户可以查看自己创建的所有提示词列表，并检索特定提示词查看详细内容。

**Why this priority**: 有了创建功能后，用户需要能够管理和查看历史提示词，这是基本的 CRUD 操作。

**Independent Test**: 用户访问提示词列表页面，查看所有提示词，点击某个提示词查看详情。可以通过准备测试数据独立测试此功能。

**Acceptance Scenarios**:

1. **Given** 用户已创建多个提示词, **When** 用户访问提示词列表页面, **Then** 系统显示所有提示词，按创建时间倒序排列，显示提示词标题和创建时间
2. **Given** 用户在列表页面, **When** 用户点击某个提示词, **Then** 系统显示提示词的完整详情，包括歌词、风格、人声和器乐参数
3. **Given** 用户没有创建任何提示词, **When** 用户访问列表页面, **Then** 系统显示"暂无提示词"提示，并提供创建按钮

---

### User Story 3 - Associate Generated Outputs (Priority: P3)

用户可以为提示词关联生成的音乐输出信息（音频文件 URL、生成时间、模型参数），建立提示词和输出的追踪关系。

**Why this priority**: 这是追溯性功能的基础，但不是最小可用版本的必需功能，可以在基本 CRUD 完成后添加。

**Independent Test**: 用户在提示词详情页面点击"添加输出关联"，输入生成的音频 URL 和参数，系统保存关联。可以通过验证数据库中的关联记录独立测试。

**Acceptance Scenarios**:

1. **Given** 用户查看某个提示词详情, **When** 用户点击"添加输出关联"并输入音频 URL 和生成参数, **Then** 系统保存关联，在提示词详情页显示关联的输出列表
2. **Given** 某个提示词已有关联输出, **When** 用户查看该提示词详情, **Then** 系统显示所有关联输出，包括创建时间、音频 URL 和生成参数
3. **Given** 用户尝试关联无效的 URL, **When** 用户提交关联, **Then** 系统显示 URL 格式错误提示

---

### Edge Cases

- 当用户输入超长歌词（>3500字符）时，系统显示字符数超限警告，参考 Minimax 的 3500 字符限制，但允许保存（质量评分降低）
- 当用户输入的风格描述超过 2000 字符时，系统显示超限警告，但允许保存
- 当用户尝试保存空提示词（既无歌词也无风格）时，系统拒绝并提示至少需要其中之一（这是唯一的硬性约束）
- 当用户保存完全无结构的提示词（无标签、格式混乱）时，系统显示"质量极低"警告，说明可能影响生成稳定性，但仍允许保存
- 当数据库连接失败时，系统显示友好的错误消息，不暴露技术细节
- 当用户同时创建大量提示词时，系统应该保持响应性，避免阻塞

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST 提供表单界面用于创建结构化提示词，包含 lyrics（歌词）、style（风格）、vocal（人声参数）、instrumental（器乐配置）四个主要组件
- **FR-002**: System SHOULD 检查 lyrics 组件是否包含标准章节标签（[Verse]、[Chorus]、[Bridge]、[Intro]、[Outro]、[Hook]、[Drop]、[Solo]、[Build-up]、[Instrumental]、[Breakdown]、[Break]、[Interlude]），缺少时显示警告但不阻止保存
- **FR-003**: System SHOULD 警告用户 lyrics 超过 3500 字符或 style 超过 2000 字符（参考 Minimax 限制），但允许保存
- **FR-004**: System MUST 为每个保存的提示词生成唯一 ID 和时间戳
- **FR-005**: System MUST 使用 JSON Schema 验证提示词数据结构，验证不通过时显示清晰的警告消息，但允许用户选择仍然保存
- **FR-005b**: System MUST 拒绝完全空的提示词（既无 lyrics 也无 style），这是唯一的硬性约束
- **FR-006**: System MUST 持久化存储提示词到数据库，支持后续检索
- **FR-007**: System MUST 提供 API 端点用于创建、读取、列表查询提示词
- **FR-008**: System MUST 支持为提示词关联生成输出信息（音频 URL、生成参数、时间戳）
- **FR-009**: System MUST 在提示词和输出之间建立双向关联，提示词可以查看关联的输出，输出可以追溯到源提示词
- **FR-010**: System MUST 为所有 API 响应使用一致的 JSON 格式，包含成功/失败状态和数据/错误信息
- **FR-011**: System MUST 为每个提示词计算并存储质量评分（高/中/低），基于结构完整性、标签使用、字段完整度等因素
- **FR-012**: System SHOULD 在 UI 中显示提示词的质量指示器，帮助用户识别高质量提示词以获得更稳定的生成结果

### Key Entities

- **Prompt**（提示词）：核心实体，包含四个主要组件
  - `lyrics`: 带章节标签的结构化歌词文本（建议 ≤3500 字符）
  - `style`: 音乐风格描述，包括曲风、情感、BPM、场景等（建议 ≤2000 字符）
  - `vocal`: 人声参数描述（可选），包括性别、音色、风格、效果等
  - `instrumental`: 器乐配置描述（可选），包括乐器列表、制作参数等
  - `id`: 唯一标识符（UUID）
  - `version`: 语义化版本号（MAJOR.MINOR.PATCH）
  - `quality_score`: 质量评分（"high" | "medium" | "low"），基于结构完整性
  - `quality_warnings`: 质量警告列表（如缺少标签、超长、格式问题等）
  - `created_at`: 创建时间戳
  - `updated_at`: 更新时间戳

- **Output**（生成输出）：记录使用提示词生成的音乐作品
  - `id`: 唯一标识符（UUID）
  - `prompt_id`: 关联的提示词 ID（外键）
  - `audio_url`: 生成的音频文件 URL
  - `model_version`: 使用的生成模型版本（如 "Music-2.5"）
  - `generation_params`: 生成时使用的参数（JSON 格式）
  - `created_at`: 生成时间戳

- **PromptSchema**（提示词 Schema）：定义提示词的 JSON Schema 结构，用于验证

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 用户可以在 3 分钟内完成一个完整提示词的创建和保存
- **SC-002**: 系统对提示词的 schema 验证响应时间在 200ms 以内
- **SC-003**: 提示词列表页面加载时间在 1 秒以内（包含最多 100 个提示词）
- **SC-004**: 系统可以存储和检索至少 10,000 个提示词而不出现性能降级
- **SC-005**: 所有警告消息清晰易懂，90% 的用户无需查看文档即可理解警告并决定是否修正
- **SC-006**: 质量评分准确反映提示词的结构完整性，高质量提示词获得更稳定的生成结果

## Assumptions

- 用户熟悉 Minimax Audio 或类似的 AI 音乐生成工具
- 用户理解结构化提示词可以提高生成稳定性，但即使不完全遵循结构也能生成音乐
- 系统初期只支持中文和英文
- 音频文件本身不存储在系统中，只记录外部 URL
- 初始版本不包含用户认证，所有提示词公开访问（后续版本添加）
- 使用关系型数据库存储结构化数据
- 质量评分算法可以在后续版本中优化，初期使用简单规则（标签数量、字段完整度等）

## Out of Scope (Not in MVP)

- 用户认证和权限管理
- 提示词版本控制和历史记录
- 提示词模板库和推荐
- 批量操作和导入/导出
- 与 Minimax API 的直接集成（自动生成音乐）
- 音频文件的实际存储和播放
- 提示词分享和协作功能
- 高级搜索和过滤功能
