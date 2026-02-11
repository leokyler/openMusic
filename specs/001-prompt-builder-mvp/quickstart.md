# Quickstart Guide

**Feature**: Structured Prompt Builder MVP  
**Purpose**: 开发环境设置和运行指南

## 前置条件

### 必需软件

- **Node.js**: >= 20.0.0
- **pnpm**: >= 9.0.0
- **PostgreSQL**: >= 14.0
- **Git**: >= 2.30.0
- **Vitest**: 自动安装（测试框架）

### 可选工具

- **Prisma Studio**: 数据库可视化（已包含在 Prisma CLI）
- **VS Code**: 推荐编辑器
  - 扩展: Prisma, ESLint, Prettier, Tailwind CSS IntelliSense, Vitest

## 初始设置

### 1. 克隆仓库

```bash
cd /home/leo/myspace/openMusic
git checkout 001-prompt-builder-mvp  # 确认在正确分支
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

创建 `.env.local` 文件：

```bash
# .env.local

# PostgreSQL 连接字符串
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/openmusic_dev?schema=public"

# 示例（本地开发）
# DATABASE_URL="postgresql://leo:password@localhost:5432/openmusic_dev?schema=public"

# Next.js 配置
NODE_ENV="development"
```

### 4. 设置 PostgreSQL 数据库

#### 选项 A: 使用本地 PostgreSQL

```bash
# 创建数据库
psql -U postgres
CREATE DATABASE openmusic_dev;
CREATE USER leo WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE openmusic_dev TO leo;
\q
```

#### 选项 B: 使用 Docker

```bash
docker run --name openmusic-postgres \
  -e POSTGRES_DB=openmusic_dev \
  -e POSTGRES_USER=leo \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### 5. 安装 Prisma CLI

```bash
# 全局安装（可选）
pnpm add -g prisma

# 或使用项目本地版本
npx prisma --version
```

### 6. 初始化数据库 Schema

```bash
# 创建 Prisma schema 文件
mkdir -p prisma
touch prisma/schema.prisma
```

将以下内容复制到 `prisma/schema.prisma`：

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Prompt {
  id               String       @id @default(uuid())
  version          String       @default("1.0.0")

  lyrics           String?      @db.Text
  style            String?      @db.Text
  vocal            Json?
  instrumental     Json?

  qualityScore     QualityScore @map("quality_score")
  qualityWarnings  Json         @default("[]") @map("quality_warnings")

  outputs          Output[]

  createdAt        DateTime     @default(now()) @map("created_at")
  updatedAt        DateTime     @updatedAt @map("updated_at")

  @@index([createdAt(sort: Desc)])
  @@index([qualityScore])
  @@map("prompts")
}

model Output {
  id                String   @id @default(uuid())
  promptId          String   @map("prompt_id")

  audioUrl          String   @map("audio_url") @db.VarChar(500)
  modelVersion      String   @map("model_version") @default("Music-2.5") @db.VarChar(50)
  generationParams  Json     @default("{}") @map("generation_params")

  prompt            Prompt   @relation(fields: [promptId], references: [id], onDelete: Cascade)

  createdAt         DateTime @default(now()) @map("created_at")

  @@index([promptId])
  @@index([createdAt(sort: Desc)])
  @@map("outputs")
}

enum QualityScore {
  high
  medium
  low
}
```

### 7. 运行数据库迁移

```bash
# 创建初始迁移
npx prisma migrate dev --name init

# 生成 Prisma Client
npx prisma generate
```

### 8. (可选) 添加种子数据

创建 `prisma/seed.ts`：

```typescript
import { PrismaClient, QualityScore } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("开始填充种子数据...");

  const prompt1 = await prisma.prompt.create({
    data: {
      version: "1.0.0",
      lyrics: `[Verse 1]
在夜空下徘徊
寻找失去的光彩

[Chorus]
星光闪耀，照亮前方
勇敢前行，不再迷茫`,
      style: "Pop, Acoustic, Emotional, 80-100 BPM",
      vocal: {
        gender: "female",
        timbre: "清澈、温暖",
        style: "抒情",
      },
      instrumental: {
        instruments: ["acoustic guitar", "piano", "light percussion"],
        bpm: 90,
      },
      qualityScore: "high",
      qualityWarnings: [],
    },
  });

  console.log("创建提示词:", prompt1.id);

  const output1 = await prisma.output.create({
    data: {
      promptId: prompt1.id,
      audioUrl: "https://example.com/audio/sample1.mp3",
      modelVersion: "Music-2.5",
      generationParams: {
        seed: 12345,
        temperature: 0.8,
      },
    },
  });

  console.log("创建输出:", output1.id);
  console.log("种子数据填充完成！");
}

main()
  .catch((e) => {
    console.error("填充失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

在 `package.json` 添加：

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

运行种子脚本：

```bash
# 安装 tsx（TypeScript 执行器）
pnpm add -D tsx

# 运行种子数据
npx prisma db seed
```

### 9. 配置 Vitest

创建 `vitest.config.ts`：

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.*',
        '**/.*',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

创建 `tests/setup.ts`：

```typescript
import '@testing-library/jest-dom';
```

安装依赖：

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

在 `package.json` 中添加测试脚本：

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test"
  }
}
```

## 运行开发服务器

### 启动 Next.js

```bash
pnpm dev
```

服务器将在 http://localhost:3000 启动。

### 验证 API 端点

```bash
# 测试健康检查（如果实现）
curl http://localhost:3000/api/health

# 测试创建提示词
curl -X POST http://localhost:3000/api/prompts \
  -H "Content-Type: application/json" \
  -d '{
    "lyrics": "[Verse]\n测试歌词",
    "style": "Pop"
  }'

# 测试获取列表
curl http://localhost:3000/api/prompts
```

## 开发工具

### Prisma Studio (数据库可视化)

```bash
npx prisma studio
```

在 http://localhost:5555 打开 Prisma Studio 可视化界面。

### 查看数据库 Schema

```bash
npx prisma db pull  # 从数据库拉取 schema
npx prisma format   # 格式化 schema 文件
```

### 重置数据库

```bash
# ⚠️ 警告：这会删除所有数据！
npx prisma migrate reset

# 然后重新运行迁移和种子
npx prisma migrate dev
npx prisma db seed
```

## 项目结构

```
openMusic/
├── app/                          # Next.js App Router
│   ├── api/                      # API 路由
│   │   └── prompts/
│   │       ├── route.ts          # GET /api/prompts, POST /api/prompts
│   │       └── [id]/
│   │           ├── route.ts      # GET /api/prompts/:id
│   │           └── outputs/
│   │               └── route.ts  # GET/POST /api/prompts/:id/outputs
│   ├── prompts/                  # 前端页面
│   │   ├── page.tsx              # 列表页
│   │   ├── [id]/
│   │   │   └── page.tsx          # 详情页
│   │   └── new/
│   │       └── page.tsx          # 创建页
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/                   # React 组件
│   ├── ui/                       # shadcn/ui 组件
│   └── prompt/                   # 提示词相关组件
│       ├── prompt-form.tsx
│       ├── prompt-card.tsx
│       └── quality-badge.tsx
├── lib/                          # 工具库
│   ├── schemas/                  # JSON Schema 验证
│   │   ├── prompt.schema.json
│   │   └── output.schema.json
│   ├── services/                 # 业务逻辑
│   │   ├── prompt.service.ts
│   │   ├── quality.service.ts
│   │   └── output.service.ts
│   ├── prisma.ts                 # Prisma 客户端单例
│   └── utils.ts
├── prisma/
│   ├── schema.prisma             # 数据库 schema
│   ├── migrations/               # 迁移文件
│   └── seed.ts                   # 种子数据
├── tests/                        # 测试文件
│   ├── unit/
│   └── e2e/
├── .env.local                    # 环境变量（不提交）
├── .env.example                  # 环境变量示例
├── package.json
└── tsconfig.json
```

## 常见任务

### 添加新的 API 端点

1. 在 `app/api/` 创建新路由文件
2. 实现 `GET`, `POST` 等方法
3. 使用 Prisma Client 访问数据库
4. 更新 OpenAPI 规范

### 添加新的 UI 组件

1. 在 `components/` 创建组件文件
2. 使用 shadcn/ui 组件作为基础
3. 遵循 Tailwind CSS 设计系统

### 修改数据库 Schema

1. 编辑 `prisma/schema.prisma`
2. 创建迁移: `npx prisma migrate dev --name <migration_name>`
3. 更新 TypeScript 类型: `npx prisma generate`

### 运行测试

```bash
# 单元测试（Vitest）
pnpm test

# 监听模式
pnpm test:watch

# UI 模式
pnpm test:ui

# E2E 测试（Playwright）
pnpm test:e2e

# 测试覆盖率
pnpm test:coverage
```

## 故障排除

### 数据库连接失败

```bash
# 检查 PostgreSQL 是否运行
sudo systemctl status postgresql

# 测试连接
psql -U leo -d openmusic_dev -h localhost
```

### Prisma Client 生成失败

```bash
# 清除缓存并重新生成
rm -rf node_modules/.prisma
npx prisma generate
```

### 端口被占用

```bash
# 查找占用 3000 端口的进程
lsof -i :3000

# 终止进程
kill -9 <PID>

# 或使用其他端口
pnpm dev -- -p 3001
```

### TypeScript 类型错误

```bash
# 重新生成 Prisma Client 类型
npx prisma generate

# 清除 Next.js 缓存
rm -rf .next
pnpm dev
```

## 部署

### Vercel (推荐)

1. 在 Vercel 创建新项目
2. 连接 Git 仓库
3. 添加环境变量 `DATABASE_URL`
4. 部署：`vercel --prod`

Vercel 会自动运行 Prisma 迁移。

### 手动部署

```bash
# 构建生产版本
pnpm build

# 运行迁移
npx prisma migrate deploy

# 启动生产服务器
pnpm start
```

## 下一步

- 📖 阅读 [data-model.md](./data-model.md) 了解数据结构
- 📖 阅读 [contracts/prompts.openapi.yaml](./contracts/prompts.openapi.yaml) 了解 API 规范
- 🔨 查看 Phase 2 任务列表开始实现功能
- 🧪 编写测试用例

## 参考资源

- [Next.js 文档](https://nextjs.org/docs)
- [Prisma 文档](https://www.prisma.io/docs)
- [shadcn/ui 组件](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vitest 文档](https://vitest.dev)
- [React Testing Library](https://testing-library.com/react)
- [Playwright 文档](https://playwright.dev)
- [Minimax Audio API](https://platform.minimaxi.com/document/audio)
