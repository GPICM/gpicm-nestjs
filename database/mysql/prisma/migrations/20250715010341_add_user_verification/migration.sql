-- AlterTable
ALTER TABLE `user_credentials` ADD COLUMN `is_verified` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `user_verifications` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'EMAIL_CHANGE', 'MFA') NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `ip_address` VARCHAR(191) NULL,
    `user_agent` VARCHAR(191) NULL,
    `verified_at` DATETIME(3) NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_id` INTEGER NOT NULL,
    `provider` ENUM('EMAIL_PASSWORD', 'GOOGLE') NOT NULL,

    UNIQUE INDEX `user_verifications_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_verifications` ADD CONSTRAINT `user_verifications_user_id_provider_fkey` FOREIGN KEY (`user_id`, `provider`) REFERENCES `user_credentials`(`user_id`, `provider`) ON DELETE CASCADE ON UPDATE CASCADE;
