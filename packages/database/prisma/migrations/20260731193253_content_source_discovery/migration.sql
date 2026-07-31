-- CreateEnum
CREATE TYPE "ContentSourceProviderType" AS ENUM ('RSS_FEED', 'LOCAL_FOLDER', 'PARTNER_API');

-- AlterTable
ALTER TABLE "source_video" ADD COLUMN     "external_ref" TEXT;

-- CreateTable
CREATE TABLE "content_source_config" (
    "id" TEXT NOT NULL,
    "niche_id" TEXT NOT NULL,
    "provider_type" "ContentSourceProviderType" NOT NULL,
    "name" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "license_type" "LicenseType" NOT NULL,
    "license_reference" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_source_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "source_video_niche_id_external_ref_key" ON "source_video"("niche_id", "external_ref");

-- AddForeignKey
ALTER TABLE "content_source_config" ADD CONSTRAINT "content_source_config_niche_id_fkey" FOREIGN KEY ("niche_id") REFERENCES "niche"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

