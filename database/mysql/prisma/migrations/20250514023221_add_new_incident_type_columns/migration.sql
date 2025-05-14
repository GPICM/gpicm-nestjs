/*
  Warnings:

  - You are about to drop the column `incident_type` on the `incidents` table. All the data in the column will be lost.
  - Added the required column `slug` to the `incident_types` table without a default value. This is not possible if the table is not empty.
  - Added the required column `incident_type_id` to the `incidents` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `incidents` DROP FOREIGN KEY `incidents_incident_type_fkey`;

-- DropIndex
DROP INDEX `incidents_incident_type_fkey` ON `incidents`;

-- AlterTable
ALTER TABLE `incident_types` ADD COLUMN `image_url` VARCHAR(191) NULL,
    ADD COLUMN `slug` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `incidents` DROP COLUMN `incident_type`,
    ADD COLUMN `incident_type_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `incidents` ADD CONSTRAINT `incidents_incident_type_id_fkey` FOREIGN KEY (`incident_type_id`) REFERENCES `incident_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
