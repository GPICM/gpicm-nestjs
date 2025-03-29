-- AlterTable
ALTER TABLE `incidents` MODIFY `title` LONGTEXT NOT NULL,
    MODIFY `description` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `posts` MODIFY `title` LONGTEXT NOT NULL,
    MODIFY `content` LONGTEXT NOT NULL;
