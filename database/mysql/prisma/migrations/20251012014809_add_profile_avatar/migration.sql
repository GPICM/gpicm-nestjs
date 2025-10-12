-- AlterTable
ALTER TABLE `profiles` ADD COLUMN `avatar_image_sources` JSON NULL,
    ADD COLUMN `avatar_url` VARCHAR(191) NULL;
