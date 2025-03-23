/*
  Warnings:

  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `uuid` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `user_credentials` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,is_primary]` on the table `user_credentials` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[public_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `user_credentials` table without a default value. This is not possible if the table is not empty.
  - The required column `public_id` was added to the `users` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Made the column `device_key` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `users_email_key` ON `users`;

-- DropIndex
DROP INDEX `users_uuid_key` ON `users`;

-- AlterTable
ALTER TABLE `user_credentials` ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `is_primary` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `last_password_change_At` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `email`,
    DROP COLUMN `uuid`,
    ADD COLUMN `bio` VARCHAR(191) NULL,
    ADD COLUMN `birth_date` DATETIME(3) NULL,
    ADD COLUMN `gender` VARCHAR(191) NULL,
    ADD COLUMN `is_verified` BOOLEAN NULL,
    ADD COLUMN `last_login_at` DATETIME(3) NULL,
    ADD COLUMN `phone_number` VARCHAR(191) NULL,
    ADD COLUMN `profile_picture` VARCHAR(191) NULL,
    ADD COLUMN `public_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` ENUM('ACTIVE', 'BANNED', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    MODIFY `role` ENUM('USER', 'GUEST', 'ADMIN') NOT NULL DEFAULT 'GUEST',
    MODIFY `device_key` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `user_credentials_email_key` ON `user_credentials`(`email`);

-- CreateIndex
CREATE UNIQUE INDEX `user_credentials_user_id_is_primary_key` ON `user_credentials`(`user_id`, `is_primary`);

-- CreateIndex
CREATE UNIQUE INDEX `users_public_id_key` ON `users`(`public_id`);
