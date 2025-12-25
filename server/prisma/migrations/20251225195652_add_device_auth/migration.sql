/*
  Warnings:

  - You are about to drop the column `answer` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `question` on the `Card` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,name,parentId]` on the table `Group` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('TEXT', 'AUDIO', 'VIDEO', 'IMAGE');

-- CreateEnum
CREATE TYPE "ReviewResponse" AS ENUM ('AGAIN', 'HARD', 'EASY');

-- DropIndex
DROP INDEX "Group_userId_name_key";

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "answer",
DROP COLUMN "date",
DROP COLUMN "question",
ADD COLUMN     "answerMediaUrl" TEXT,
ADD COLUMN     "answerText" TEXT,
ADD COLUMN     "answerType" "ContentType" NOT NULL DEFAULT 'TEXT',
ADD COLUMN     "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
ADD COLUMN     "interval" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nextReviewAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "questionMediaUrl" TEXT,
ADD COLUMN     "questionText" TEXT,
ADD COLUMN     "questionType" "ContentType" NOT NULL DEFAULT 'TEXT',
ADD COLUMN     "repetitions" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "parentId" TEXT;

-- CreateTable
CREATE TABLE "CardReview" (
    "id" SERIAL NOT NULL,
    "cardId" INTEGER NOT NULL,
    "response" "ReviewResponse" NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceToken" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "deviceName" TEXT NOT NULL DEFAULT 'Python CLI',
    "accessToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DeviceToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceAuthRequest" (
    "id" TEXT NOT NULL,
    "deviceCode" TEXT NOT NULL,
    "userCode" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL DEFAULT 'Python CLI',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "authorizedAt" TIMESTAMP(3),
    "userId" INTEGER,
    "accessToken" TEXT,

    CONSTRAINT "DeviceAuthRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CardReview_cardId_idx" ON "CardReview"("cardId");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceToken_accessToken_key" ON "DeviceToken"("accessToken");

-- CreateIndex
CREATE INDEX "DeviceToken_userId_idx" ON "DeviceToken"("userId");

-- CreateIndex
CREATE INDEX "DeviceToken_accessToken_idx" ON "DeviceToken"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceAuthRequest_deviceCode_key" ON "DeviceAuthRequest"("deviceCode");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceAuthRequest_userCode_key" ON "DeviceAuthRequest"("userCode");

-- CreateIndex
CREATE INDEX "DeviceAuthRequest_deviceCode_idx" ON "DeviceAuthRequest"("deviceCode");

-- CreateIndex
CREATE INDEX "DeviceAuthRequest_userCode_idx" ON "DeviceAuthRequest"("userCode");

-- CreateIndex
CREATE INDEX "Card_nextReviewAt_idx" ON "Card"("nextReviewAt");

-- CreateIndex
CREATE INDEX "Group_parentId_idx" ON "Group"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Group_userId_name_parentId_key" ON "Group"("userId", "name", "parentId");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardReview" ADD CONSTRAINT "CardReview_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceToken" ADD CONSTRAINT "DeviceToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceAuthRequest" ADD CONSTRAINT "DeviceAuthRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
