/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `incident_types` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[internal_id]` on the table `incident_types` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `incident_types` MODIFY `name` VARCHAR(191) NOT NULL,
    MODIFY `slug` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `incident_types_slug_key` ON `incident_types`(`slug`);

-- CreateIndex
CREATE UNIQUE INDEX `incident_types_internal_id_key` ON `incident_types`(`internal_id`);
