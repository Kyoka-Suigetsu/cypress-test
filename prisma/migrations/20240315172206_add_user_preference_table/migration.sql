/*
  Warnings:

  - You are about to drop the column `languagePreference` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userPreferenceId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `languagePreference`,
    ADD COLUMN `userPreferenceId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `UserPreference` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `language` VARCHAR(191) NOT NULL DEFAULT 'eng_Latn',
    `volume` DECIMAL(65, 30) NOT NULL DEFAULT 1.0,
    `muted` BOOLEAN NOT NULL DEFAULT false,
    `fontSize` INTEGER NOT NULL DEFAULT 16,

    UNIQUE INDEX `UserPreference_userId_key`(`userId`),
    INDEX `UserPreference_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_userPreferenceId_key` ON `User`(`userPreferenceId`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_userPreferenceId_fkey` FOREIGN KEY (`userPreferenceId`) REFERENCES `UserPreference`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
