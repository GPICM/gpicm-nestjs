/*
  Warnings:

  - You are about to drop the `user_agreements` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `user_agreements` DROP FOREIGN KEY `user_agreements_user_id_fkey`;

-- DropTable
DROP TABLE `user_agreements`;
