/*
  Warnings:

  - Made the column `slug` on table `workbooks` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "workbooks" ALTER COLUMN "slug" SET NOT NULL;

-- CreateTable
CREATE TABLE "printables" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "printables_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "printables" ADD CONSTRAINT "printables_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
