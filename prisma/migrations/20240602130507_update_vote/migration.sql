/*
  Warnings:

  - Added the required column `userEnrollment` to the `Vote` table without a default value. This is not possible if the table is not empty.
  - Made the column `votingId` on table `Vote` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_votingId_fkey";

-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "userEnrollment" TEXT NOT NULL,
ALTER COLUMN "votingId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_votingId_fkey" FOREIGN KEY ("votingId") REFERENCES "Voting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userEnrollment_fkey" FOREIGN KEY ("userEnrollment") REFERENCES "User"("enrollment") ON DELETE RESTRICT ON UPDATE CASCADE;
