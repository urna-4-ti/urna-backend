/*
  Warnings:

  - A unique constraint covering the columns `[enrollment]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `PoliticalType` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NamesPR" AS ENUM ('Parlamentarismo', 'Presidencialismo', 'SemiPresidencialismo');

-- DropForeignKey
ALTER TABLE "Candidate" DROP CONSTRAINT "Candidate_politicalPartyId_fkey";

-- DropForeignKey
ALTER TABLE "PoliticalParty" DROP CONSTRAINT "PoliticalParty_politicalTypeId_fkey";

-- AlterTable
ALTER TABLE "PoliticalType" ADD COLUMN     "description" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "PoliticalRegime" (
    "id" TEXT NOT NULL,
    "name" "NamesPR" NOT NULL,
    "cod" INTEGER NOT NULL,

    CONSTRAINT "PoliticalRegime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voting" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "class" "Classes" NOT NULL,

    CONSTRAINT "Voting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "governmentId" TEXT,
    "politicalRegimeId" TEXT,
    "candidateId" TEXT,
    "class" "Classes" NOT NULL,
    "votingId" TEXT NOT NULL,
    "userEnrollment" TEXT NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PoliticalRegime_cod_key" ON "PoliticalRegime"("cod");

-- CreateIndex
CREATE INDEX "Vote_id_governmentId_politicalRegimeId_candidateId_idx" ON "Vote"("id", "governmentId", "politicalRegimeId", "candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "User_enrollment_key" ON "User"("enrollment");

-- CreateIndex
CREATE INDEX "User_id_enrollment_idx" ON "User"("id", "enrollment");

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_politicalPartyId_fkey" FOREIGN KEY ("politicalPartyId") REFERENCES "PoliticalParty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticalParty" ADD CONSTRAINT "PoliticalParty_politicalTypeId_fkey" FOREIGN KEY ("politicalTypeId") REFERENCES "PoliticalType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_governmentId_fkey" FOREIGN KEY ("governmentId") REFERENCES "Government"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_politicalRegimeId_fkey" FOREIGN KEY ("politicalRegimeId") REFERENCES "PoliticalRegime"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_votingId_fkey" FOREIGN KEY ("votingId") REFERENCES "Voting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userEnrollment_fkey" FOREIGN KEY ("userEnrollment") REFERENCES "User"("enrollment") ON DELETE RESTRICT ON UPDATE CASCADE;
