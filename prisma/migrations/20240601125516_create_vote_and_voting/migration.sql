-- CreateTable
CREATE TABLE "Voting" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Voting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "governmentId" TEXT,
    "politicalRegimeId" TEXT,
    "class" "Classes" NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vote_id_governmentId_politicalRegimeId_idx" ON "Vote"("id", "governmentId", "politicalRegimeId");

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_governmentId_fkey" FOREIGN KEY ("governmentId") REFERENCES "Government"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_politicalRegimeId_fkey" FOREIGN KEY ("politicalRegimeId") REFERENCES "PoliticalRegime"("id") ON DELETE SET NULL ON UPDATE CASCADE;
