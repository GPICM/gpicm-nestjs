import { Injectable, Logger } from "@nestjs/common";

import {
  EmailService,
  SendEmailOptions,
} from "../domain/interfaces/services/email-service";

@Injectable()
export class MockMailerService extends EmailService {
  private readonly logger = new Logger(MockMailerService.name);

  async sendEmail(mailOptions: SendEmailOptions): Promise<void> {
    this.logger.log(`Mock send email to: ${mailOptions.to}`);
    this.logger.log(`Subject: ${mailOptions.subject}`);
    this.logger.log(`Text: ${mailOptions.text}`);
    this.logger.log(`HTML: ${mailOptions.html}`);
    return Promise.resolve();
  }
}
