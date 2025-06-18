/*
  Warnings:

  - You are about to drop the column `image_preview_url` on the `incidents` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `incidents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `incidents` DROP COLUMN `image_preview_url`,
    DROP COLUMN `image_url`;
