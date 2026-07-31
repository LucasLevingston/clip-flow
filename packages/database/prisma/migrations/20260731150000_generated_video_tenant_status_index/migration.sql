-- CreateIndex
CREATE INDEX "generated_video_tenant_id_status_created_at_idx" ON "generated_video"("tenant_id", "status", "created_at" DESC);
