-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('ADMIN', 'MANAGER', 'PARTICIPANT', 'ANONYMOUS') NOT NULL;