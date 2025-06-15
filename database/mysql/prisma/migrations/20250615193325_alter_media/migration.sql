/*
  Warnings:

  - You are about to drop the column `contentType` on the `medias` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `medias` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `medias` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `medias` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `medias` table. All the data in the column will be lost.
  - You are about to alter the column `type` on the `medias` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(5))` to `Enum(EnumId(8))`.
  - You are about to drop the `post_medias` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `scope` to the `medias` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scopeId` to the `medias` table without a default value. This is not possible if the table is not empty.
  - Added the required column `target` to the `medias` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `medias` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `post_medias` DROP FOREIGN KEY `post_medias_mediaId_fkey`;

-- DropForeignKey
ALTER TABLE `post_medias` DROP FOREIGN KEY `post_medias_postId_fkey`;

-- AlterTable
ALTER TABLE `medias` DROP COLUMN `contentType`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `provider`,
    DROP COLUMN `size`,
    DROP COLUMN `url`,
    ADD COLUMN `altText` VARCHAR(191) NULL,
    ADD COLUMN `caption` VARCHAR(191) NULL,
    ADD COLUMN `content_type` VARCHAR(191) NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `display_order` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `scope` ENUM('POSTS', 'USERS') NOT NULL,
    ADD COLUMN `scopeId` INTEGER NOT NULL,
    ADD COLUMN `sources` JSON NULL,
    ADD COLUMN `status` ENUM('CREATED', 'UPLOADING', 'ACTIVE', 'FAILED', 'DELETED') NOT NULL DEFAULT 'CREATED',
    ADD COLUMN `target` ENUM('POSTS_GENERIC_IMAGE', 'POSTS_GENERIC_AUDIO', 'POSTS_GENERIC_DOCUMENT', 'USERS_AVATAR') NOT NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `filename` VARCHAR(191) NULL,
    MODIFY `type` ENUM('IMAGE', 'AUDIO', 'DOCUMENT', 'OTHER') NOT NULL DEFAULT 'OTHER';

-- DropTable
DROP TABLE `post_medias`;

-- CreateIndex
CREATE INDEX `medias_scope_scopeId_idx` ON `medias`(`scope`, `scopeId`);
