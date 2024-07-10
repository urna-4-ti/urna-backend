-- DropIndex
DROP INDEX "Vote_id_governmentId_politicalRegimeId_candidateId_idx";

-- CreateIndex
CREATE INDEX "Vote_id_governmentId_politicalRegimeId_candidateId_whiteVot_idx" ON "Vote"("id", "governmentId", "politicalRegimeId", "candidateId", "whiteVote");
