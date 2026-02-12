# 测试指南

## 概述

项目使用 Vitest 作为测试框架，测试分为三类：

1. **单元测试** - 不需要数据库连接（如：quality-scorer, validation-performance）
2. **集成测试** - 需要数据库连接（如：list-performance）
3. **E2E 测试** - 完整的用户流程测试（使用 Playwright）

## 快速开始

### 运行所有单元测试（不需要数据库）

```bash
pnpm test tests/unit/quality-scorer.test.ts
pnpm test tests/unit/validation-performance.test.ts
```

### 设置测试数据库

对于需要数据库的测试，你有几个选项：

#### 选项 1: 使用现有数据库

```bash
# 直接使用现有的 DATABASE_URL
DATABASE_URL="postgresql://USER:PASS@localhost:5432/openmusic_dev" pnpm test
```

#### 选项 2: 创建测试数据库

```bash
# 1. 创建测试数据库
psql -U postgres -c "CREATE DATABASE openmusic_test;"

# 2. 运行迁移
DATABASE_URL="postgresql://USER:PASS@localhost:5432/openmusic_test" \
  npx prisma migrate deploy

# 3. 运行测试
DATABASE_URL="postgresql://USER:PASS@localhost:5432/openmusic_test" \
  pnpm test tests/unit/list-performance.test.ts
```

#### 选项 3: 使用 Docker

```bash
# 启动测试数据库容器
docker run --name openmusic-test-db \
  -e POSTGRES_DB=openmusic_test \
  -e POSTGRES_USER=leo \
  -e POSTGRES_PASSWORD=password \
  -p 5433:5432 \
  -d postgres:16-alpine

# 运行测试
DATABASE_URL="postgresql://leo:password@localhost:5433/openmusic_test" \
  pnpm test tests/unit/list-performance.test.ts

# 清理
docker stop openmusic-test-db
docker rm openmusic-test-db
```

## 测试文件说明

### 单元测试（无需数据库）

- `tests/unit/quality-scorer.test.ts` - 质量评分算法测试
- `tests/unit/validation-performance.test.ts` - Schema 验证性能测试

### 集成测试（需要数据库）

- `tests/unit/list-performance.test.ts` - 列表页性能测试
  - 测试数据库查询性能
  - 验证分页功能
  - 确保满足 <1s/100 条 (SC-003)

## 性能测试

### Schema 验证性能 (SC-002)

```bash
pnpm test tests/unit/validation-performance.test.ts
```

**期望结果**：所有测试 <200ms

### 列表页性能 (SC-003)

```bash
# 设置测试数据库
export DATABASE_URL="postgresql://USER:PASS@localhost:5432/openmusic_test"

# 运行性能测试
pnpm test tests/unit/list-performance.test.ts
```

**期望结果**：

- 加载 20 条记录 <1000ms
- 加载 50 条记录 <1000ms
- 加载 100 条记录 <1000ms

## 故障排除

### 数据库连接失败

**错误**：`SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string`

**原因**：未设置 DATABASE_URL 或格式不正确

**解决**：

```bash
# 检查环境变量
echo $DATABASE_URL

# 或在命令行中设置
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/db" pnpm test
```

### Prisma Client 未生成

**错误**：`Cannot find module '@prisma/client'`

**解决**：

```bash
npx prisma generate
```

### 测试被跳过

如果看到 `SKIP` 消息，说明数据库不可用。检查：

1. DATABASE_URL 是否设置
2. PostgreSQL 是否运行
3. 数据库是否已创建
4. 迁移是否已运行

## 持续集成

在 CI/CD 环境中，建议：

```yaml
# .github/workflows/test.yml 示例
- name: Setup test database
  run: |
    docker run -d --name test-db -e POSTGRES_PASSWORD=test postgres:16
    export DATABASE_URL="postgresql://postgres:test@localhost:5432/postgres"
    npx prisma migrate deploy

- name: Run unit tests
  run: pnpm test tests/unit/quality-scorer.test.ts

- name: Run performance tests
  run: pnpm test tests/unit/list-performance.test.ts
  env:
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```

## 覆盖率

生成测试覆盖率报告：

```bash
pnpm test:coverage

# 查看报告
open coverage/index.html
```

**目标覆盖率**：

- 语句覆盖率: >80%
- 分支覆盖率: >70%
- 函数覆盖率: >80%
