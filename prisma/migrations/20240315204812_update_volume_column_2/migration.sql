/*
  Warnings:

  - You are about to alter the column `volume` on the `UserPreference` table. The data in that column could be lost. The data in that column will be cast from `Decimal(2,1)` to `Decimal(3,2)`.

*/
-- AlterTable
ALTER TABLE `UserPreference` MODIFY `volume` DECIMAL(3, 2) NOT NULL DEFAULT 1.0;
