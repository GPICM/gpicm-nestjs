/*
  Warnings:

  - You are about to drop the column `user_id` on the `post_comments` table. All the data in the column will be lost.
  - The primary key for the `post_votes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user_id` on the `post_votes` table. All the data in the column will be lost.
  - Added the required column `profile_id` to the `post_comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_id` to the `post_votes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `post_comments` DROP FOREIGN KEY `post_comments_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `post_votes` DROP FOREIGN KEY `post_votes_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `posts` DROP FOREIGN KEY `posts_author_id_fkey`;

-- DropIndex
DROP INDEX `post_comments_user_id_fkey` ON `post_comments`;

-- DropIndex
DROP INDEX `post_votes_user_id_fkey` ON `post_votes`;

-- DropIndex
DROP INDEX `posts_author_id_fkey` ON `posts`;

-- AlterTable
ALTER TABLE `post_comments` DROP COLUMN `user_id`,
    ADD COLUMN `profile_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `post_votes` DROP PRIMARY KEY,
    DROP COLUMN `user_id`,
    ADD COLUMN `profile_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`post_id`, `profile_id`);

-- AlterTable
ALTER TABLE `profiles` ADD COLUMN `reputation` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_votes` ADD CONSTRAINT `post_votes_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_comments` ADD CONSTRAINT `post_comments_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
