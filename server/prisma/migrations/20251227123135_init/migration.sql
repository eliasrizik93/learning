-- AlterTable
ALTER TABLE "User" ADD COLUMN     "country" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "profileVisible" BOOLEAN NOT NULL DEFAULT true;
