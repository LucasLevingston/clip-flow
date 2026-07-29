-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED');

-- CreateEnum
CREATE TYPE "NicheStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('PUBLIC_DOMAIN', 'CREATIVE_COMMONS', 'PARTNER_AGREEMENT');

-- CreateEnum
CREATE TYPE "SourceVideoStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PromptTemplateType" AS ENUM ('HIGHLIGHT_SELECTION', 'COPY_GENERATION');

-- CreateEnum
CREATE TYPE "ChannelPlatforms" AS ENUM ('SHORTS_ONLY', 'TIKTOK_ONLY', 'BOTH');

-- CreateEnum
CREATE TYPE "ChannelStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED');

-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('YOUTUBE', 'TIKTOK');

-- CreateEnum
CREATE TYPE "SocialAccountStatus" AS ENUM ('CONNECTED', 'NEEDS_REAUTH', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "GeneratedVideoStatus" AS ENUM ('SOURCING', 'TRANSCRIBING', 'PENDING_MODERATION', 'CONTENT_READY', 'CUTTING', 'READY_TO_PUBLISH', 'PUBLISHED', 'FAILED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PublishRecordStatus" AS ENUM ('PUBLISHED', 'FAILED');

-- CreateEnum
CREATE TYPE "AuditActorType" AS ENUM ('TENANT_USER', 'PLATFORM_ADMIN', 'SYSTEM');

-- CreateTable
CREATE TABLE "tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_platform_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "MembershipRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_token" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "device_info" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "MembershipRole" NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "max_channels" INTEGER NOT NULL,
    "max_videos_per_day_per_channel" INTEGER NOT NULL,
    "price_cents" INTEGER NOT NULL,

    CONSTRAINT "plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "current_period_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "niche" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "NicheStatus" NOT NULL DEFAULT 'INACTIVE',
    "active_prompt_template_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "niche_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_video" (
    "id" TEXT NOT NULL,
    "niche_id" TEXT NOT NULL,
    "duration_seconds" INTEGER NOT NULL,
    "license_type" "LicenseType" NOT NULL,
    "license_reference" TEXT NOT NULL,
    "status" "SourceVideoStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "storage_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "source_video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_template" (
    "id" TEXT NOT NULL,
    "niche_id" TEXT NOT NULL,
    "type" "PromptTemplateType" NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prompt_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "niche_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "prompt_override" TEXT,
    "videos_per_day" INTEGER NOT NULL,
    "publish_times" JSONB NOT NULL,
    "generation_time" TEXT NOT NULL,
    "platforms" "ChannelPlatforms" NOT NULL,
    "thumbnail_enabled" BOOLEAN NOT NULL DEFAULT true,
    "status" "ChannelStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_account" (
    "id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "external_account_id" TEXT NOT NULL,
    "status" "SocialAccountStatus" NOT NULL DEFAULT 'CONNECTED',
    "encrypted_tokens" BYTEA NOT NULL,
    "token_key_version" INTEGER NOT NULL,
    "refresh_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "social_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel_insights" (
    "channel_id" TEXT NOT NULL,
    "best_publish_hours" JSONB NOT NULL,
    "top_title_patterns" JSONB NOT NULL,
    "top_hashtags" JSONB NOT NULL,
    "avg_optimal_duration_ms" INTEGER NOT NULL,
    "computed_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "channel_insights_pkey" PRIMARY KEY ("channel_id")
);

-- CreateTable
CREATE TABLE "generated_video" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "source_video_id" TEXT NOT NULL,
    "batch_run_id" TEXT NOT NULL,
    "scheduled_publish_at" TIMESTAMP(3) NOT NULL,
    "status" "GeneratedVideoStatus" NOT NULL DEFAULT 'SOURCING',
    "highlight" JSONB,
    "copy" JSONB,
    "thumbnail_url" TEXT,
    "final_asset_url" TEXT,
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generated_video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcript" (
    "id" TEXT NOT NULL,
    "source_video_id" TEXT NOT NULL,
    "segments" JSONB NOT NULL,
    "language" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transcript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publish_record" (
    "id" TEXT NOT NULL,
    "generated_video_id" TEXT NOT NULL,
    "social_account_id" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "external_post_id" TEXT,
    "status" "PublishRecordStatus" NOT NULL,
    "failure_reason" TEXT,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "publish_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_snapshot" (
    "id" TEXT NOT NULL,
    "publish_record_id" TEXT NOT NULL,
    "views" INTEGER NOT NULL,
    "likes" INTEGER NOT NULL,
    "comments" INTEGER NOT NULL,
    "shares" INTEGER NOT NULL,
    "retention_rate" DOUBLE PRECISION NOT NULL,
    "ctr" DOUBLE PRECISION NOT NULL,
    "collected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preference" (
    "user_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "email_enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "notification_preference_pkey" PRIMARY KEY ("user_id","category")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "actor_type" "AuditActorType" NOT NULL,
    "action" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "membership_tenant_id_user_id_key" ON "membership"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_token_hash_key" ON "refresh_token"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_token_user_id_idx" ON "refresh_token"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_tenant_id_email_key" ON "invitation"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "plan_name_key" ON "plan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_tenant_id_key" ON "subscription"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "niche_slug_key" ON "niche"("slug");

-- CreateIndex
CREATE INDEX "source_video_niche_id_status_idx" ON "source_video"("niche_id", "status");

-- CreateIndex
CREATE INDEX "channel_tenant_id_status_idx" ON "channel"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "channel_niche_id_status_idx" ON "channel"("niche_id", "status");

-- CreateIndex
CREATE INDEX "social_account_channel_id_status_idx" ON "social_account"("channel_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "social_account_channel_id_platform_key" ON "social_account"("channel_id", "platform");

-- CreateIndex
CREATE INDEX "generated_video_tenant_id_created_at_idx" ON "generated_video"("tenant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "generated_video_channel_id_created_at_idx" ON "generated_video"("channel_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "generated_video_channel_id_source_video_id_idx" ON "generated_video"("channel_id", "source_video_id");

-- CreateIndex
CREATE UNIQUE INDEX "generated_video_channel_id_batch_run_id_scheduled_publish_a_key" ON "generated_video"("channel_id", "batch_run_id", "scheduled_publish_at");

-- CreateIndex
CREATE UNIQUE INDEX "transcript_source_video_id_key" ON "transcript"("source_video_id");

-- CreateIndex
CREATE UNIQUE INDEX "publish_record_generated_video_id_social_account_id_key" ON "publish_record"("generated_video_id", "social_account_id");

-- CreateIndex
CREATE INDEX "analytics_snapshot_publish_record_id_collected_at_idx" ON "analytics_snapshot"("publish_record_id", "collected_at" DESC);

-- CreateIndex
CREATE INDEX "notification_tenant_id_user_id_read_at_idx" ON "notification"("tenant_id", "user_id", "read_at");

-- AddForeignKey
ALTER TABLE "membership" ADD CONSTRAINT "membership_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership" ADD CONSTRAINT "membership_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_video" ADD CONSTRAINT "source_video_niche_id_fkey" FOREIGN KEY ("niche_id") REFERENCES "niche"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_template" ADD CONSTRAINT "prompt_template_niche_id_fkey" FOREIGN KEY ("niche_id") REFERENCES "niche"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel" ADD CONSTRAINT "channel_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel" ADD CONSTRAINT "channel_niche_id_fkey" FOREIGN KEY ("niche_id") REFERENCES "niche"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_account" ADD CONSTRAINT "social_account_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_insights" ADD CONSTRAINT "channel_insights_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_video" ADD CONSTRAINT "generated_video_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_video" ADD CONSTRAINT "generated_video_source_video_id_fkey" FOREIGN KEY ("source_video_id") REFERENCES "source_video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcript" ADD CONSTRAINT "transcript_source_video_id_fkey" FOREIGN KEY ("source_video_id") REFERENCES "source_video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publish_record" ADD CONSTRAINT "publish_record_generated_video_id_fkey" FOREIGN KEY ("generated_video_id") REFERENCES "generated_video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publish_record" ADD CONSTRAINT "publish_record_social_account_id_fkey" FOREIGN KEY ("social_account_id") REFERENCES "social_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_snapshot" ADD CONSTRAINT "analytics_snapshot_publish_record_id_fkey" FOREIGN KEY ("publish_record_id") REFERENCES "publish_record"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preference" ADD CONSTRAINT "notification_preference_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
