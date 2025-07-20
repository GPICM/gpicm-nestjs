-- AlterTable
ALTER TABLE `posts` ADD COLUMN `author` JSON NULL,
    ADD COLUMN `tags` JSON NULL;
