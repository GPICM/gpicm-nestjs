/*
  Warnings:

  - You are about to drop the column `image` on the `achievements` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `achievements` DROP COLUMN `image`,
    ADD COLUMN `image_blur_hash` VARCHAR(191) NULL,
    ADD COLUMN `image_sources` JSON NULL,
    ADD COLUMN `image_thumbnail_url` VARCHAR(191) NULL,
    ADD COLUMN `rewards` JSON NULL;
