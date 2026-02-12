/**
 * Prisma 种子数据脚本
 * 用于开发环境的初始数据填充
 * 运行方式：npx prisma db seed
 */
import { PrismaClient, QualityScore } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始填充种子数据...');

  // 创建示例提示词 1 - 高质量完整提示词
  const prompt1 = await prisma.prompt.create({
    data: {
      version: '1.0.0',
      lyrics: `[Verse 1]
在夜空下徘徊
寻找失去的光彩

[Chorus]
星光闪耀，照亮前方
勇敢前行，不再迷茫`,
      style: 'Pop, Acoustic, Emotional, 80-100 BPM',
      vocal: {
        gender: 'female',
        timbre: '清澈、温暖',
        style: '抒情',
      },
      instrumental: {
        instruments: ['acoustic guitar', 'piano', 'light percussion'],
        bpm: 90,
      },
      qualityScore: QualityScore.high,
      qualityWarnings: [],
    },
  });

  console.log('创建提示词 1:', prompt1.id);

  // 创建示例提示词 2 - 中等质量（部分缺失）
  const prompt2 = await prisma.prompt.create({
    data: {
      version: '1.0.0',
      lyrics: '简单的歌词，没有章节标签',
      style: 'Rock, Electric Guitar',
      qualityScore: QualityScore.medium,
      qualityWarnings: ['缺少章节标签，建议使用 [Verse]、[Chorus] 等', '建议添加器乐配置'],
    },
  });

  console.log('创建提示词 2:', prompt2.id);

  // 创建示例提示词 3 - 低质量（仅歌词）
  const prompt3 = await prisma.prompt.create({
    data: {
      version: '1.0.0',
      lyrics: '只有简单的歌词内容',
      qualityScore: QualityScore.low,
      qualityWarnings: [
        '缺少章节标签，建议使用 [Verse]、[Chorus] 等',
        '建议添加风格描述',
        '建议添加人声参数',
        '建议添加器乐配置',
      ],
    },
  });

  console.log('创建提示词 3:', prompt3.id);

  // 为提示词 1 创建关联输出
  const output1 = await prisma.output.create({
    data: {
      promptId: prompt1.id,
      audioUrl: 'https://example.com/audio/sample1.mp3',
      modelVersion: 'Music-2.5',
      generationParams: {
        seed: 12345,
        temperature: 0.8,
      },
    },
  });

  console.log('创建输出 1:', output1.id);

  // 为提示词 1 创建第二个输出
  const output2 = await prisma.output.create({
    data: {
      promptId: prompt1.id,
      audioUrl: 'https://example.com/audio/sample2.mp3',
      modelVersion: 'Music-2.5',
      generationParams: {
        seed: 54321,
        temperature: 0.9,
      },
    },
  });

  console.log('创建输出 2:', output2.id);

  console.log('种子数据填充完成！');
}

main()
  .catch((e) => {
    console.error('填充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
