/*
  Warnings:

  - The primary key for the `profile_achievements` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `achievementId` on the `profile_achievements` table. All the data in the column will be lost.
  - You are about to drop the column `profileId` on the `profile_achievements` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[handle]` on the table `profile_achievements` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profile_id,achievement_id]` on the table `profile_achievements` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `achievement_id` to the `profile_achievements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `criteria_snapshot` to the `profile_achievements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `handle` to the `profile_achievements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `profile_achievements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_id` to the `profile_achievements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rewards_snapshot` to the `profile_achievements` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `profile_achievements` DROP FOREIGN KEY `profile_achievements_achievementId_fkey`;

-- DropForeignKey
ALTER TABLE `profile_achievements` DROP FOREIGN KEY `profile_achievements_profileId_fkey`;

-- DropIndex
DROP INDEX `profile_achievements_achievementId_fkey` ON `profile_achievements`;

-- AlterTable
ALTER TABLE `profile_achievements` DROP PRIMARY KEY,
    DROP COLUMN `achievementId`,
    DROP COLUMN `profileId`,
    ADD COLUMN `achievement_id` INTEGER NOT NULL,
    ADD COLUMN `criteria_snapshot` JSON NOT NULL,
    ADD COLUMN `handle` VARCHAR(191) NOT NULL,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `profile_id` INTEGER NOT NULL,
    ADD COLUMN `rewards_snapshot` JSON NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE UNIQUE INDEX `profile_achievements_handle_key` ON `profile_achievements`(`handle`);

-- CreateIndex
CREATE UNIQUE INDEX `profile_achievements_profile_id_achievement_id_key` ON `profile_achievements`(`profile_id`, `achievement_id`);

-- AddForeignKey
ALTER TABLE `profile_achievements` ADD CONSTRAINT `profile_achievements_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profile_achievements` ADD CONSTRAINT `profile_achievements_achievement_id_fkey` FOREIGN KEY (`achievement_id`) REFERENCES `achievements`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
