/*
  Warnings:

  - You are about to alter the column `volume` on the `UserPreference` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(2,1)`.

*/
-- AlterTable
ALTER TABLE `UserPreference` MODIFY `volume` DECIMAL(2, 1) NOT NULL DEFAULT 1.0;
