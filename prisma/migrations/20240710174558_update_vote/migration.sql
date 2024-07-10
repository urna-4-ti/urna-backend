-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_userEnrollment_fkey";

-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
