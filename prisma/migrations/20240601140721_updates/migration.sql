/*
  Warnings:

  - Added the required column `class` to the `Voting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "votingId" TEXT;

-- AlterTable
ALTER TABLE "Voting" ADD COLUMN     "class" "Classes" NOT NULL;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_votingId_fkey" FOREIGN KEY ("votingId") REFERENCES "Voting"("id") ON DELETE SET NULL ON UPDATE CASCADE;
