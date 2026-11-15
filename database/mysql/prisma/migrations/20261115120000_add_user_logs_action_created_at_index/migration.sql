-- CreateIndex
CREATE INDEX `user_logs_action_created_at_idx` ON `user_logs`(`action`, `created_at`);
