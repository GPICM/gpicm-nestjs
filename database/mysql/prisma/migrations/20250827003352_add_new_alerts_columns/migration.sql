/*
  Warnings:

  - A unique constraint covering the columns `[external_reference]` on the table `civil_defense_alerts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `external_reference` to the `civil_defense_alerts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `civil_defense_alerts` ADD COLUMN `expires_at` DATETIME(3) NULL,
    ADD COLUMN `external_reference` VARCHAR(191) NOT NULL,
    ADD COLUMN `publish_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updated_at` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `civil_defense_alerts_external_reference_key` ON `civil_defense_alerts`(`external_reference`);
