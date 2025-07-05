/*
  Warnings:

  - You are about to drop the column `profile_picture` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `profile_picture`,
    ADD COLUMN `avatar_image_sources` JSON NULL,
    ADD COLUMN `avatar_media_id` VARCHAR(191) NULL;
