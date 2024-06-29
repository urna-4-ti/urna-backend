/*
  Warnings:

  - You are about to drop the column `votingId` on the `Vote` table. All the data in the column will be lost.
  - You are about to drop the `Voting` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `electionId` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_governmentId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_politicalRegimeId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_userEnrollment_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_votingId_fkey";

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "electionId" TEXT;

-- AlterTable
ALTER TABLE "Government" ADD COLUMN     "electionId" TEXT;

-- AlterTable
ALTER TABLE "PoliticalRegime" ADD COLUMN     "electionId" TEXT;

-- AlterTable
ALTER TABLE "Vote" DROP COLUMN "votingId",
ADD COLUMN     "electionId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Voting";

-- CreateTable
CREATE TABLE "Election" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "class" "Classes" NOT NULL,

    CONSTRAINT "Election_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticalRegime" ADD CONSTRAINT "PoliticalRegime_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Government" ADD CONSTRAINT "Government_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_governmentId_fkey" FOREIGN KEY ("governmentId") REFERENCES "Government"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_politicalRegimeId_fkey" FOREIGN KEY ("politicalRegimeId") REFERENCES "PoliticalRegime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userEnrollment_fkey" FOREIGN KEY ("userEnrollment") REFERENCES "User"("enrollment") ON DELETE CASCADE ON UPDATE CASCADE;
