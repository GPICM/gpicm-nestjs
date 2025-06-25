-- AlterTable
ALTER TABLE `posts` ADD COLUMN `cover_image_sources` JSON NULL,
    ADD COLUMN `keywords` VARCHAR(191) NULL,
    ADD COLUMN `views` INTEGER NOT NULL DEFAULT 0;
