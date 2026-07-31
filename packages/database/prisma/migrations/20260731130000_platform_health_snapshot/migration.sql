-- CreateTable
CREATE TABLE "platform_health_snapshot" (
    "id" TEXT NOT NULL,
    "queues" JSONB NOT NULL,
    "integrations" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_health_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "platform_health_snapshot_created_at_idx" ON "platform_health_snapshot"("created_at" DESC);
