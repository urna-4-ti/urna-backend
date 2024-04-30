-- DropForeignKey
ALTER TABLE "Candidate" DROP CONSTRAINT "Candidate_politicalPartyId_fkey";

-- DropForeignKey
ALTER TABLE "PoliticalParty" DROP CONSTRAINT "PoliticalParty_politicalTypeId_fkey";

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_politicalPartyId_fkey" FOREIGN KEY ("politicalPartyId") REFERENCES "PoliticalParty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticalParty" ADD CONSTRAINT "PoliticalParty_politicalTypeId_fkey" FOREIGN KEY ("politicalTypeId") REFERENCES "PoliticalType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
