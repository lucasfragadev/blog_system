/*
  Warnings:

  - A unique constraint covering the columns `[familyMemberId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MASCULINO', 'FEMININO', 'OUTRO');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "familyMemberId" TEXT,
ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'OUTRO';

-- CreateTable
CREATE TABLE "family_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "gender" "Gender" NOT NULL DEFAULT 'OUTRO',
    "isAlive" BOOLEAN NOT NULL DEFAULT true,
    "fatherId" TEXT,
    "motherId" TEXT,
    "spouseId" TEXT,

    CONSTRAINT "family_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "family_members_spouseId_key" ON "family_members"("spouseId");

-- CreateIndex
CREATE UNIQUE INDEX "users_familyMemberId_key" ON "users"("familyMemberId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES "family_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_fatherId_fkey" FOREIGN KEY ("fatherId") REFERENCES "family_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_motherId_fkey" FOREIGN KEY ("motherId") REFERENCES "family_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_spouseId_fkey" FOREIGN KEY ("spouseId") REFERENCES "family_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
