-- CreateEnum
CREATE TYPE "QualityScore" AS ENUM ('high', 'medium', 'low');

-- CreateTable
CREATE TABLE "prompts" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "lyrics" TEXT,
    "style" TEXT,
    "vocal" JSONB,
    "instrumental" JSONB,
    "quality_score" "QualityScore" NOT NULL,
    "quality_warnings" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outputs" (
    "id" TEXT NOT NULL,
    "prompt_id" TEXT NOT NULL,
    "audio_url" VARCHAR(500) NOT NULL,
    "model_version" VARCHAR(50) NOT NULL DEFAULT 'Music-2.5',
    "generation_params" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outputs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prompts_created_at_idx" ON "prompts"("created_at" DESC);

-- CreateIndex
CREATE INDEX "prompts_quality_score_idx" ON "prompts"("quality_score");

-- CreateIndex
CREATE INDEX "outputs_prompt_id_idx" ON "outputs"("prompt_id");

-- CreateIndex
CREATE INDEX "outputs_created_at_idx" ON "outputs"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "outputs" ADD CONSTRAINT "outputs_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
