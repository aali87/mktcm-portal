-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('FULL', 'PLAN');

-- AlterTable: Add new fields to Purchase
ALTER TABLE "purchases" ADD COLUMN "stripeSubscriptionId" TEXT;
ALTER TABLE "purchases" ADD COLUMN "paymentType" "PaymentType";
ALTER TABLE "purchases" ADD COLUMN "planComplete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Update Workbook with new fields
ALTER TABLE "workbooks" ADD COLUMN "slug" TEXT;
ALTER TABLE "workbooks" ADD COLUMN "s3FolderPath" TEXT;
ALTER TABLE "workbooks" ADD COLUMN "totalPages" INTEGER;
ALTER TABLE "workbooks" ADD COLUMN "bonusOnly" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "workbooks" RENAME COLUMN "order" TO "orderIndex";
ALTER TABLE "workbooks" ALTER COLUMN "fileUrl" DROP NOT NULL;

-- CreateTable: WorkbookProgress
CREATE TABLE "workbook_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workbookId" TEXT NOT NULL,
    "lastViewedPage" INTEGER NOT NULL DEFAULT 1,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "lastViewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workbook_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workbook_progress_userId_workbookId_key" ON "workbook_progress"("userId", "workbookId");

-- CreateIndex
CREATE UNIQUE INDEX "workbooks_slug_key" ON "workbooks"("slug");

-- AddForeignKey
ALTER TABLE "workbook_progress" ADD CONSTRAINT "workbook_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workbook_progress" ADD CONSTRAINT "workbook_progress_workbookId_fkey" FOREIGN KEY ("workbookId") REFERENCES "workbooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
