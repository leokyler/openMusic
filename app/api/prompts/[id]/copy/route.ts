import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: promptId } = await params;

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

    const updated = await prisma.prompt.update({
      where: { id: promptId },
      data: {
        copyCount: { increment: 1 },
        lastCopiedAt: new Date(),
      },
      select: {
        copyCount: true,
        lastCopiedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      copy_count: updated.copyCount,
      last_copied_at: updated.lastCopiedAt?.toISOString() ?? null,
    });
  } catch (error) {
    console.error('Copy tracking error:', error);

    return NextResponse.json(
      { error: 'Internal server error', details: 'Failed to update copy tracking metrics' },
      { status: 500 }
    );
  }
}
