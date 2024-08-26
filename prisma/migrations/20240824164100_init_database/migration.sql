-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('ADMIN', 'VOTER');

-- CreateEnum
CREATE TYPE "Classes" AS ENUM ('TI_1', 'TI_2', 'TI_3', 'TI_4', 'TQ_1', 'TQ_2', 'TQ_3', 'TQ_4', 'TMA_1', 'TMA_2', 'TMA_3', 'TMA_4', 'TA_1', 'TA_2', 'TA_3', 'TA_4', 'ADMIN');

-- CreateEnum
CREATE TYPE "NamesPR" AS ENUM ('Parlamentarismo', 'Presidencialismo', 'SemiPresidencialismo');

-- CreateEnum
CREATE TYPE "electionStatus" AS ENUM ('CREATED', 'IN_PROGRESS', 'DONE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Roles" NOT NULL,
    "enrollment" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashPassword" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "class" "Classes" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cod" INTEGER NOT NULL,
    "picPath" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "politicalPartyId" TEXT NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoliticalType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cod" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "PoliticalType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoliticalParty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "class" "Classes" NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "governmentId" TEXT,

    CONSTRAINT "PoliticalParty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoliticalRegime" (
    "id" TEXT NOT NULL,
    "name" "NamesPR" NOT NULL,
    "cod" INTEGER NOT NULL,

    CONSTRAINT "PoliticalRegime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Government" (
    "id" TEXT NOT NULL,
    "cod" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Government_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Election" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "class" "Classes" NOT NULL,
    "status" "electionStatus" NOT NULL DEFAULT 'CREATED',

    CONSTRAINT "Election_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "governmentId" TEXT,
    "politicalRegimeId" TEXT,
    "candidateId" TEXT,
    "class" "Classes" NOT NULL,
    "electionId" TEXT NOT NULL,
    "userEnrollment" TEXT NOT NULL,
    "whiteVote" BOOLEAN,
    "userId" TEXT,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CandidateToElection" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ElectionToPoliticalRegime" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ElectionToGovernment" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_enrollment_key" ON "User"("enrollment");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_id_enrollment_idx" ON "User"("id", "enrollment");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_cod_key" ON "Candidate"("cod");

-- CreateIndex
CREATE UNIQUE INDEX "PoliticalType_cod_key" ON "PoliticalType"("cod");

-- CreateIndex
CREATE UNIQUE INDEX "PoliticalRegime_cod_key" ON "PoliticalRegime"("cod");

-- CreateIndex
CREATE INDEX "Vote_id_governmentId_politicalRegimeId_candidateId_whiteVot_idx" ON "Vote"("id", "governmentId", "politicalRegimeId", "candidateId", "whiteVote");

-- CreateIndex
CREATE UNIQUE INDEX "_CandidateToElection_AB_unique" ON "_CandidateToElection"("A", "B");

-- CreateIndex
CREATE INDEX "_CandidateToElection_B_index" ON "_CandidateToElection"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ElectionToPoliticalRegime_AB_unique" ON "_ElectionToPoliticalRegime"("A", "B");

-- CreateIndex
CREATE INDEX "_ElectionToPoliticalRegime_B_index" ON "_ElectionToPoliticalRegime"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ElectionToGovernment_AB_unique" ON "_ElectionToGovernment"("A", "B");

-- CreateIndex
CREATE INDEX "_ElectionToGovernment_B_index" ON "_ElectionToGovernment"("B");

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_politicalPartyId_fkey" FOREIGN KEY ("politicalPartyId") REFERENCES "PoliticalParty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticalParty" ADD CONSTRAINT "PoliticalParty_governmentId_fkey" FOREIGN KEY ("governmentId") REFERENCES "Government"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_governmentId_fkey" FOREIGN KEY ("governmentId") REFERENCES "Government"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_politicalRegimeId_fkey" FOREIGN KEY ("politicalRegimeId") REFERENCES "PoliticalRegime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CandidateToElection" ADD CONSTRAINT "_CandidateToElection_A_fkey" FOREIGN KEY ("A") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CandidateToElection" ADD CONSTRAINT "_CandidateToElection_B_fkey" FOREIGN KEY ("B") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ElectionToPoliticalRegime" ADD CONSTRAINT "_ElectionToPoliticalRegime_A_fkey" FOREIGN KEY ("A") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ElectionToPoliticalRegime" ADD CONSTRAINT "_ElectionToPoliticalRegime_B_fkey" FOREIGN KEY ("B") REFERENCES "PoliticalRegime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ElectionToGovernment" ADD CONSTRAINT "_ElectionToGovernment_A_fkey" FOREIGN KEY ("A") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ElectionToGovernment" ADD CONSTRAINT "_ElectionToGovernment_B_fkey" FOREIGN KEY ("B") REFERENCES "Government"("id") ON DELETE CASCADE ON UPDATE CASCADE;
