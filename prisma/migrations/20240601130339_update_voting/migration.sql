-- DropIndex
DROP INDEX "Vote_id_governmentId_politicalRegimeId_idx";

-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "candidateId" TEXT;

-- CreateIndex
CREATE INDEX "Vote_id_governmentId_politicalRegimeId_candidateId_idx" ON "Vote"("id", "governmentId", "politicalRegimeId", "candidateId");

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
