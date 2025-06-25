-- AlterTable
ALTER TABLE `users` ADD COLUMN `latitude` DOUBLE NULL,
    ADD COLUMN `location_updated_at` DATETIME(3) NULL,
    ADD COLUMN `longitude` DOUBLE NULL;
