-- AddForeignKey
ALTER TABLE `post_comments` ADD CONSTRAINT `post_comments_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `post_comments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
