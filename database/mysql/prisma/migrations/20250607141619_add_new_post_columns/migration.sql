/*
  Warnings:

  - You are about to alter the column `status` on the `posts` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(3))` to `Enum(EnumId(4))`.
  - A unique constraint covering the columns `[uuid]` on the table `posts` will be added. If there are existing duplicate values, this will fail.
  - The required column `uuid` was added to the `posts` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE `posts` ADD COLUMN `down_votes` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `is_pinned` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `is_verified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `score` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `up_votes` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `uuid` VARCHAR(191) NOT NULL,
    MODIFY `status` ENUM('DRAFT', 'PUBLISHING', 'PUBLISHED', 'UNLISTED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE `post_medias` (
    `mediaId` INTEGER NOT NULL,
    `postId` INTEGER NOT NULL,
    `order` INTEGER NULL,

    PRIMARY KEY (`mediaId`, `postId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `contentType` VARCHAR(191) NOT NULL,
    `size` INTEGER NULL,
    `type` ENUM('IMAGE', 'AUDIO', 'VIDEO', 'DOCUMENT') NOT NULL,
    `provider` ENUM('LOCAL', 'S3', 'OTHER') NOT NULL DEFAULT 'LOCAL',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_votes` (
    `post_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `value` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`post_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `posts_uuid_key` ON `posts`(`uuid`);

-- AddForeignKey
ALTER TABLE `post_medias` ADD CONSTRAINT `post_medias_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `medias`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_medias` ADD CONSTRAINT `post_medias_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_votes` ADD CONSTRAINT `post_votes_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_votes` ADD CONSTRAINT `post_votes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
