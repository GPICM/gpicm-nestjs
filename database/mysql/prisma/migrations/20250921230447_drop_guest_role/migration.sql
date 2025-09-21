/*
  Warnings:

  - You are about to alter the column `role` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER';
