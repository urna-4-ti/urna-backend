-- DropForeignKey
ALTER TABLE "Government" DROP CONSTRAINT "Government_electionId_fkey";

-- DropForeignKey
ALTER TABLE "PoliticalRegime" DROP CONSTRAINT "PoliticalRegime_electionId_fkey";

-- AddForeignKey
ALTER TABLE "PoliticalRegime" ADD CONSTRAINT "PoliticalRegime_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Government" ADD CONSTRAINT "Government_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE SET NULL ON UPDATE CASCADE;
