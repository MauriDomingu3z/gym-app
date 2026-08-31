/*
  Warnings:

  - Added the required column `nameEs` to the `Exercise` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- Default temporal solo para permitir agregar la columna sobre las 302 filas
-- existentes; el seed (seedExercises.ts) sobreescribe nameEs con la traducción real.
ALTER TABLE "Exercise" ADD COLUMN     "nameEs" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Exercise" ALTER COLUMN "nameEs" DROP DEFAULT;
