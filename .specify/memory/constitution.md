<!--
SYNC IMPACT REPORT - openMusic Constitution v1.0.0
================================================================
Version Change: 初始创建 → 1.0.0
Modified Principles: N/A (初始版本)
Added Sections:
  - Core Principles (5 项原则)
  - Technical Standards
  - Development Workflow
  - Governance

Templates Status:
  ✅ plan-template.md - Constitution Check 与原则一致
  ✅ spec-template.md - User scenarios 支持提示词测试
  ✅ tasks-template.md - Task categories 支持架构验证

Follow-up TODOs: None - 所有占位符已填充
================================================================
-->

# openMusic Constitution

## Core Principles

### I. Structured Prompt Design

每个 AI 音乐提示词必须遵循已定义且经过验证的架构：

- **Lyrics Component**: 使用章节标签进行结构化（[Verse]、[Chorus]、[Bridge]、[Intro]、[Outro] 等）
- **Style Component**: 包括流派、情感标签、场景标签、BPM 和乐器配置细节
- **Vocal Parameters**: 性别、音色、风格、和声、效果（混响、自动调音）和和声信息
- **Production Specs**: 人声和乐器的空间感、动态处理、立体声场
- **Structural Analysis**: 按歌曲结构章节的演奏特征
- 没有清晰结构的提示词不得进入生成阶段

**Rationale**: 结构化提示词确保可重现性，支持版本控制，并在 AI 音乐生成中保持质量一致性。基于文本的结构化格式支持版本控制、协作以及提示词工程技术的系统化改进。

### II. Output Traceability (NON-NEGOTIABLE)

每个生成的音乐输出必须与其源提示词保持双向关联：

- 每个输出链接到：确切的提示词版本、生成时间戳、模型参数和生成上下文
- 每个提示词跟踪：从其生成的所有输出、成功/失败指标、用户反馈
- 关联元数据一旦创建必须不可变
- 所有生成必须记录足够的元数据以便重现

**Rationale**: 可追溯性支持提示词迭代、A/B 测试、质量分析和知识产权管理。没有可追溯性，提示词改进将变成猜测，输出作为学习数据的价值也会丧失。

### III. Schema Validation

所有提示词数据在生成前必须通过已定义架构的验证：

- JSON schemas 定义提示词组件的结构（歌词、风格、人声、器乐）
- 在任何生成请求之前自动运行验证
- 无效提示词必须停止，并显示清晰的错误消息指出违规内容
- Schema 版本必须被跟踪并与提示词关联

**Rationale**: Schema 验证防止格式错误的请求，减少生成错误，确保提示词质量。早期验证节省计算成本并保持系统可靠性。

### IV. Version Control & Change Tracking

所有提示词、schemas 和生成的输出必须进行版本控制：

- **Semantic Versioning**: MAJOR.MINOR.PATCH 格式
  - MAJOR: 破坏性 schema 变更（不兼容的提示词结构）
  - MINOR: 新增字段/功能（向后兼容）
  - PATCH: 澄清、文档、非功能性变更
- 破坏性变更需要迁移指南和弃用通知
- 保留所有版本用于历史分析和回归测试

**Rationale**: 版本控制支持回滚、A/B 对比、演进跟踪和提示词工程实践的系统化改进。历史数据为未来的提示词设计决策提供依据。

### V. Text-Based Workflow & Composability

所有提示词组件必须可通过文本格式进行管理：

- 支持 JSON、YAML 和 Markdown 格式进行提示词定义
- 支持组合：较小的提示词片段组合成完整提示词
- 用于提示词验证、生成和管理的命令行工具
- 文本格式确保友好的 git 版本控制和差异跟踪
- 结构化文本支持程序化提示词生成和模板化

**Rationale**: 文本化工作流支持开发者友好的工具、版本控制集成、自动化测试和系统化的提示词工程实践。可组合性减少重复并促进可重用的提示词模式。

## Technical Standards

### Data Model Requirements

- **Prompt Schema**: 为所有提示词组件定义 TypeScript/JSON Schema 类型
- **Output Metadata**: 包括生成参数、时间戳、模型版本和提示词引用
- **Association Model**: 提示词与输出之间的双向链接，具有不可变记录
- **Storage Format**: 结构化数据使用 JSON，人类可读文档使用 Markdown

### API & Interface Standards

- **Input Validation**: 所有 API 端点在处理前根据 schemas 验证输入
- **Output Format**: 所有 API 响应使用一致的 JSON 结构
- **Error Handling**: 结构化错误消息，包含清晰的验证失败详情
- **Documentation**: 所有公共接口使用 OpenAPI/Swagger 规范

### Quality Gates

- **Schema Compliance**: 所有提示词必须通过 schema 验证
- **Traceability Check**: 所有输出必须具有完整的关联元数据
- **Version Tagging**: 所有变更必须正确递增版本号
- **Breaking Change Review**: MAJOR 版本提升需要文档和迁移指南

## Development Workflow

### Feature Development Process

1. **Schema First**: 在实现功能前定义或更新 schemas
2. **Validation Implementation**: 编写验证逻辑和测试
3. **API Implementation**: 构建集成验证的端点
4. **Documentation**: 更新 schemas、API 文档和使用示例
5. **Integration Testing**: 测试包括验证和关联的完整工作流

### Code Review Requirements

- 验证 schema 变更遵循语义化版本控制规则
- 确认验证逻辑涵盖所有边界情况
- 检查可追溯性元数据的完整性
- 验证破坏性变更包含迁移文档
- 确保文本格式保持人类可读

### Testing Requirements

- **Unit Tests**: Schema 验证逻辑、提示词解析、元数据生成
- **Integration Tests**: 端到端提示词到输出工作流，带可追溯性验证
- **Schema Tests**: 验证 schema 定义本身（元验证）
- **Regression Tests**: 确保声称的版本升级保持向后兼容性

## Governance

本宪法是 openMusic 开发实践的最高权威。所有架构决策、功能实现和代码审查必须与这些原则保持一致。

**Amendment Process**:

1. 记录提议的变更及其理由和影响分析
2. 原则修改需要团队审查和批准
3. 根据语义化版本控制规则进行版本提升
4. 影响现有提示词/输出的破坏性变更需制定迁移计划
5. 更新所有依赖模板和文档

**Compliance Verification**:

- 所有拉取请求必须通过宪法合规性检查
- 代码审查验证是否遵循原则
- 自动验证强制执行 schema 和版本控制要求
- 每季度审计审查宪法一致性

**Living Document**: 本宪法随项目演进。定期审查确保原则保持相关性和有效性。

**Version**: 1.0.0 | **Ratified**: 2026-02-11 | **Last Amended**: 2026-02-11
