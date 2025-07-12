/*
  Warnings:

  - A unique constraint covering the columns `[email_verification_token]` on the table `user_credentials` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `user_credentials_email_verification_token_key` ON `user_credentials`(`email_verification_token`);
