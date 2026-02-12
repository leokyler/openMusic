/**
 * Performance benchmarks for list page loading
 * Ensures list loads <1s for 100 records (SC-003)
 *
 * 注意：此测试需要真实的数据库连接
 * 如果数据库不可用，测试将自动跳过
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PromptService } from '../../lib/services/prompt.service';
import { prisma } from '../../lib/prisma';
import type { CreatePromptDto } from '../../lib/types/prompt';

describe('List Page Performance', () => {
  const promptService = new PromptService();
  const createdPromptIds: string[] = [];
  let isDatabaseAvailable = false;

  beforeAll(async () => {
    try {
      // 测试数据库连接
      await prisma.$connect();
      isDatabaseAvailable = true;

      const promptCount = await prisma.prompt.count();

      if (promptCount < 100) {
        const prompts: CreatePromptDto[] = Array.from({ length: 100 - promptCount }, (_, i) => ({
          lyrics: `[Verse ${i}]\nTest lyrics ${i}\nMore text for testing`,
          style: `Style ${i}`,
        }));

        for (const promptData of prompts) {
          const prompt = await promptService.createPrompt(promptData);
          createdPromptIds.push(prompt.id);
        }
      }
    } catch (error) {
      console.warn('Database not available for performance tests:', error);
      isDatabaseAvailable = false;
    }
  });

  afterAll(async () => {
    if (createdPromptIds.length > 0 && isDatabaseAvailable) {
      await prisma.prompt.deleteMany({
        where: {
          id: {
            in: createdPromptIds,
          },
        },
      });
    }
    if (isDatabaseAvailable) {
      await prisma.$disconnect();
    }
  });

  describe('with database connection', () => {
    // 如果数据库不可用，跳过所有测试
    if (!isDatabaseAvailable) {
      it.skip('should load 20 records (first page) within 1000ms', () => {
        console.log('Skipping: Database not available. Set DATABASE_URL to run performance tests.');
      });
      return;
    }

    it('should load 20 records (first page) within 1000ms', async () => {
      const start = performance.now();
      const result = await promptService.listPrompts({
        page: 1,
        pageSize: 20,
      });
      const duration = performance.now() - start;

      expect(result.items.length).toBeLessThanOrEqual(20);
      expect(duration).toBeLessThan(1000);
    });

    it('should load 50 records within 1000ms', async () => {
      const start = performance.now();
      const result = await promptService.listPrompts({
        page: 1,
        pageSize: 50,
      });
      const duration = performance.now() - start;

      expect(result.items.length).toBeLessThanOrEqual(50);
      expect(duration).toBeLessThan(1000);
    });

    it('should load 100 records within 1000ms', async () => {
      const start = performance.now();
      const result = await promptService.listPrompts({
        page: 1,
        pageSize: 100,
      });
      const duration = performance.now() - start;

      expect(result.items.length).toBeLessThanOrEqual(100);
      expect(duration).toBeLessThan(1000);
    });

    it('should query with quality filter within 1000ms', async () => {
      const start = performance.now();
      const result = await promptService.listPrompts({
        page: 1,
        pageSize: 100,
        qualityScore: 'high',
      });
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(1000);
    });

    it('should count total records within 1000ms', async () => {
      const start = performance.now();
      const result = await promptService.listPrompts({
        page: 1,
        pageSize: 20,
      });
      const duration = performance.now() - start;

      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.totalPages).toBeGreaterThanOrEqual(0);
      expect(duration).toBeLessThan(1000);
    });

    it('should fetch second page within 1000ms', async () => {
      const start = performance.now();
      const result = await promptService.listPrompts({
        page: 2,
        pageSize: 20,
      });
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(1000);
    });
  });
});
