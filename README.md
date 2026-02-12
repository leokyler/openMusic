# OpenMusic - Structured Prompt Builder

基于 Next.js 的结构化 AI 音乐提示词管理系统，专为 Minimax 音频生成模型设计。

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 功能特性

- ✅ **提示词管理**：创建、查看列表、查看详情
- ✅ **质量评分**：自动计算提示词质量（高/中/低）并给出改进建议
- ✅ **输出追踪**：关联音频生成输出，建立提示词和输出之间的双向关联
- ✅ **灵活验证**：警告而非阻止，允许用户灵活创作
- ✅ **分页查询**：支持大规模提示词管理（10k+）
- ✅ **响应式设计**：支持桌面和移动端

## 技术栈

- **框架**: Next.js 16.1.5 (App Router)
- **UI**: React 19.2.3 + Tailwind CSS 4.1 + shadcn/ui
- **语言**: TypeScript 5.9.3
- **数据库**: PostgreSQL + Prisma ORM 7.3.0
- **验证**: JSON Schema (Ajv)
- **测试**: Vitest + React Testing Library

## 快速开始

### 环境要求

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- PostgreSQL >= 14.0

### 安装

```bash
# 安装依赖
pnpm install

# 启动数据库容器
docker compose up -d

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，设置 DATABASE_URL
```

### 数据库设置

```bash
# 运行数据库迁移
npx prisma migrate dev --name init

# 生成 Prisma Client
npx prisma generate

# （可选）填充种子数据
npx prisma db seed
```

### 开发

```bash
# 启动开发服务器
pnpm dev

# 访问应用
open http://localhost:3000
```

## 项目结构

```
openMusic/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   └── prompts/          # 提示词API
│   └── prompts/              # 前端页面
│       ├── page.tsx          # 列表页
│       ├── new/              # 创建页
│       └── [id]/             # 详情页
├── components/               # React 组件
│   ├── ui/                  # shadcn/ui 组件
│   ├── prompt/              # 提示词组件
│   └── output/              # 输出组件
├── lib/                     # 业务逻辑
│   ├── services/            # 服务层
│   ├── models/              # 数据模型
│   ├── schemas/             # JSON Schema
│   ├── middleware/          # 中间件
│   ├── types/              # 类型定义
│   └── utils/              # 工具函数
├── prisma/                 # 数据库
│   └── schema.prisma        # 数据库模型
└── tests/                  # 测试
    ├── unit/                # 单元测试
    └── integration/          # 集成测试
```

## API 文档

详细的 OpenAPI 规范：[specs/001-prompt-builder-mvp/contracts/prompts.openapi.yaml](./specs/001-prompt-builder-mvp/contracts/prompts.openapi.yaml) ⚡

### 主要端点

| 方法 | 端点                       | 描述                             |
| ---- | -------------------------- | -------------------------------- |
| POST | `/api/prompts`             | 创建提示词                       |
| GET  | `/api/prompts`             | 获取列表（支持分页、过滤、排序） |
| GET  | `/api/prompts/:id`         | 获取详情                         |
| POST | `/api/prompts/:id/outputs` | 关联音频输出                     |
| GET  | `/api/prompts/:id/outputs` | 获取输出列表                     |

## 开发指南

### 运行测试

```bash
# 单元测试（不需要数据库）
pnpm test tests/unit/quality-scorer.test.ts
pnpm test tests/unit/validation-performance.test.ts

# 性能测试（需要数据库连接）
# 1. 配置测试数据库
cp .env.test.example .env.test
# 编辑 .env.test，设置 DATABASE_URL

# 2. 运行性能测试
DATABASE_URL="postgresql://USER:PASS@localhost:5432/openmusic_test" pnpm test tests/unit/list-performance.test.ts

# 运行所有测试
pnpm test

# 监听模式
pnpm test:watch

# 覆盖率
pnpm test:coverage
```

### 代码质量

```bash
# Lint 检查
pnpm lint

# 类型检查
pnpm check-types

# 格式化
pnpm format
```

## 功能使用

### 1. 创建提示词

1. 访问 http://localhost:3000/prompts/new
2. 填写歌词（支持章节标签如 [Verse]、[Chorus]）
3. 填写风格描述（如：Pop, Acoustic, 80-100 BPM）
4. （可选）添加人声和器乐参数
5. 提交表单，系统自动计算质量评分
6. 查看质量警告（如有）并确认保存

### 2. 查看提示词列表

1. 访问 http://localhost:3000/prompts
2. 浏览所有提示词卡片
3. 使用过滤器按质量筛选
4. 使用分页控制翻页
5. 点击卡片查看详情

### 3. 关联音频输出

1. 进入提示词详情页
2. 点击"关联新输出"按钮
3. 输入从 Minimax 生成的音频 URL
4. （可选）添加生成参数（seed、temperature等）
5. 提交关联

## 质量评分系统

系统会自动计算提示词质量评分：

- **高质量 (80-100分)**: 包含完整的歌词（带章节标签）、风格、人声和器乐参数
- **中等质量 (50-79分)**: 包含歌词和风格，或部分参数
- **低质量 (0-49分)**: 仅包含歌词或风格，缺少结构化参数

**注意**：质量评分仅供参考，不影响保存。即使有警告，提示词仍然可以保存。

## 性能优化

- ✅ 数据库索引：created_at、quality_score、prompt_id
- ✅ 分页查询：默认每页20条，最大100条
- ✅ Schema验证：<200ms (SC-002)
- ✅ 列表加载：<1s/100条 (SC-003)
- ✅ 支持10k+提示词 (SC-004)

## 部署

### Vercel (推荐)

```bash
# 安装 Vercel CLI
pnpm add -g vercel

# 部署
vercel --prod
```

确保设置环境变量：

- `DATABASE_URL`: PostgreSQL 连接字符串

## 故障排除

### 数据库连接失败

```bash
# 检查 PostgreSQL 状态
sudo systemctl status postgresql

# 测试连接
psql -U USER -d DATABASE_NAME -h HOST
```

### Prisma Client 问题

```bash
# 重新生成 Prisma Client
rm -rf node_modules/.prisma
npx prisma generate
```

### 端口被占用

```bash
# 查找占用进程
lsof -i :3000

# 终止进程
kill -9 <PID>
```

## 许可证

MIT

---

**开发状态**: ✅ MVP 完成（Phase 1-6） | **版本**: 1.0.0 | **日期**: 2026-02-12
