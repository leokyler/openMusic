-- AlterTable
ALTER TABLE "prompts" ADD COLUMN     "copy_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_copied_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "prompts_copy_count_idx" ON "prompts"("copy_count" DESC);
