-- AlterTable
ALTER TABLE `user_agreements` ADD COLUMN `content_hash` VARCHAR(191) NULL,
    ADD COLUMN `ip_address` VARCHAR(191) NULL,
    ADD COLUMN `user_agent` VARCHAR(191) NULL;
