import { Injectable, Logger } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";

import {
  EmailService,
  SendEmailOptions,
} from "@/modules/shared/domain/interfaces/services/email-service";

@Injectable()
export class NodemailerEmailService extends EmailService {
  private readonly logger = new Logger(NodemailerEmailService.name);

  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      this.logger.log(`Email sent to ${options.to}`);
    } catch (error: unknown) {
      this.logger.error(`Failed to send email to ${options.to}`, { error });
      throw error;
    }
  }
}
