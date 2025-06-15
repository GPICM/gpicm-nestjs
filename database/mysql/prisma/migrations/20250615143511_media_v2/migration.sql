/*
  Warnings:

  - You are about to drop the column `size` on the `medias` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `medias` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `medias` table. All the data in the column will be lost.
  - You are about to drop the `post_medias` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `scope` to the `medias` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scopeId` to the `medias` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sources` to the `medias` table without a default value. This is not possible if the table is not empty.
  - Added the required column `target` to the `medias` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `medias` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `post_medias` DROP FOREIGN KEY `post_medias_mediaId_fkey`;

-- DropForeignKey
ALTER TABLE `post_medias` DROP FOREIGN KEY `post_medias_postId_fkey`;

-- AlterTable
ALTER TABLE `medias` DROP COLUMN `size`,
    DROP COLUMN `type`,
    DROP COLUMN `url`,
    ADD COLUMN `altText` VARCHAR(191) NULL,
    ADD COLUMN `caption` VARCHAR(191) NULL,
    ADD COLUMN `order` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `scope` ENUM('POSTS', 'USERS') NOT NULL,
    ADD COLUMN `scopeId` INTEGER NOT NULL,
    ADD COLUMN `sources` JSON NOT NULL,
    ADD COLUMN `status` ENUM('CREATED', 'UPLOADING', 'ACTIVE', 'FAILED', 'DELETED') NOT NULL DEFAULT 'CREATED',
    ADD COLUMN `target` ENUM('POSTS_GENERIC_IMAGE', 'POSTS_GENERIC_AUDIO', 'POSTS_GENERIC_DOCUMENT', 'USERS_AVATAR') NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- DropTable
DROP TABLE `post_medias`;

-- CreateIndex
CREATE INDEX `medias_scope_scopeId_idx` ON `medias`(`scope`, `scopeId`);
