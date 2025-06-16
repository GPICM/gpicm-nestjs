/*
  Warnings:

  - The primary key for the `medias` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `contentType` on the `medias` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `medias` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `medias` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `medias` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `medias` table. All the data in the column will be lost.
  - You are about to alter the column `type` on the `medias` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(5))` to `Enum(EnumId(10))`.
  - The primary key for the `post_medias` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `mediaId` on the `post_medias` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `post_medias` table. All the data in the column will be lost.
  - You are about to drop the column `postId` on the `post_medias` table. All the data in the column will be lost.
  - Added the required column `content_type` to the `medias` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner_id` to the `medias` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `medias` table without a default value. This is not possible if the table is not empty.
  - Added the required column `media_id` to the `post_medias` table without a default value. This is not possible if the table is not empty.
  - Added the required column `post_id` to the `post_medias` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `post_medias` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `post_medias` DROP FOREIGN KEY `post_medias_mediaId_fkey`;

-- DropForeignKey
ALTER TABLE `post_medias` DROP FOREIGN KEY `post_medias_postId_fkey`;

-- DropIndex
DROP INDEX `post_medias_postId_fkey` ON `post_medias`;

-- AlterTable
ALTER TABLE `medias` DROP PRIMARY KEY,
    DROP COLUMN `contentType`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `provider`,
    DROP COLUMN `size`,
    DROP COLUMN `url`,
    ADD COLUMN `altText` VARCHAR(191) NULL,
    ADD COLUMN `caption` VARCHAR(191) NULL,
    ADD COLUMN `content_type` VARCHAR(191) NOT NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `owner_id` INTEGER NOT NULL,
    ADD COLUMN `sources` JSON NULL,
    ADD COLUMN `status` ENUM('CREATED', 'UPLOADING', 'ACTIVE', 'FAILED', 'DELETED') NOT NULL DEFAULT 'CREATED',
    ADD COLUMN `storage_provider` ENUM('S3', 'LOCAL') NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `type` ENUM('IMAGE', 'AUDIO', 'DOCUMENT', 'OTHER') NOT NULL DEFAULT 'OTHER',
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `post_medias` DROP PRIMARY KEY,
    DROP COLUMN `mediaId`,
    DROP COLUMN `order`,
    DROP COLUMN `postId`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `display_order` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `media_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `post_id` INTEGER NOT NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    ADD PRIMARY KEY (`post_id`, `media_id`);

-- CreateIndex
CREATE INDEX `medias_owner_id_idx` ON `medias`(`owner_id`);

-- AddForeignKey
ALTER TABLE `post_medias` ADD CONSTRAINT `post_medias_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_medias` ADD CONSTRAINT `post_medias_media_id_fkey` FOREIGN KEY (`media_id`) REFERENCES `medias`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medias` ADD CONSTRAINT `medias_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
