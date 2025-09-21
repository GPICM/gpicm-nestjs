/*
  Warnings:

  - You are about to drop the column `comment_counts` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `post_counts` on the `profiles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[handle]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `handle` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Made the column `display_name` on table `profiles` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `profiles` DROP COLUMN `comment_counts`,
    DROP COLUMN `latitude`,
    DROP COLUMN `longitude`,
    DROP COLUMN `post_counts`,
    ADD COLUMN `comments_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `handle` VARCHAR(191) NOT NULL,
    ADD COLUMN `posts_count` INTEGER NOT NULL DEFAULT 0,
    MODIFY `display_name` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `profiles_handle_key` ON `profiles`(`handle`);
