-- CreateEnum
CREATE TYPE "NamesPR" AS ENUM ('Parlamentarismo', 'Presidencialismo', 'SemiPresidencialismo');

-- CreateTable
CREATE TABLE "PoliticalRegime" (
    "id" TEXT NOT NULL,
    "name" "NamesPR" NOT NULL,
    "cod" INTEGER NOT NULL,

    CONSTRAINT "PoliticalRegime_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PoliticalRegime_cod_key" ON "PoliticalRegime"("cod");
