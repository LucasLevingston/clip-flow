-- AlterTable
ALTER TABLE "niche" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "preview_thumbnail_url" TEXT;

-- AlterTable
ALTER TABLE "plan" ADD COLUMN     "stripe_price_id" TEXT;

-- AlterTable
ALTER TABLE "subscription" ADD COLUMN     "stripe_customer_id" TEXT,
ADD COLUMN     "stripe_subscription_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "plan_stripe_price_id_key" ON "plan"("stripe_price_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_stripe_customer_id_key" ON "subscription"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_stripe_subscription_id_key" ON "subscription"("stripe_subscription_id");
