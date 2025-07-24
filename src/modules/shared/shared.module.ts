import { Global, Module, Scope } from "@nestjs/common";
import { MongodbService } from "./services/mongodb-service";
import { MongoClient } from "mongodb";
import { HttpClient } from "./domain/interfaces/http-client/http-client";
import { AxiosHttpClient } from "./infra/lib/axios/axios-http-client";
import { PrismaService } from "./services/prisma-services";
import { UserLogsRepository } from "./domain/interfaces/repositories/user-logs-repository";
import { PrismaUserLogsRepository } from "./infra/repositories/prisma-user-logs-repository";
import { LogUserAction } from "./application/log-user-action";
import { EmailService } from "./domain/interfaces/services/email-service";
import { MailerModule } from "@nestjs-modules/mailer";
import { MockMailerService } from "./infra/MockMailerService";
import { NodemailerEmailService } from "./infra/lib/nodemailer/nodemailer-email-service";

const MONGO_DB_URI = String(process.env.MONGO_DB_URI);

@Global()
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      defaults: {
        from: '"Your App" <noreply@yourapp.com>',
      },
    }),
  ],
  controllers: [],
  providers: [
    MongodbService,
    {
      provide: EmailService,
      useClass: MockMailerService, // NodemailerEmailService,
    },
    PrismaService,
    {
      provide: MongoClient,
      useFactory: () => {
        const client = new MongoClient(MONGO_DB_URI);
        return client.connect();
      },
    },
    {
      provide: HttpClient,
      useClass: AxiosHttpClient,
      scope: Scope.DEFAULT,
    },
    {
      provide: UserLogsRepository,
      useClass: PrismaUserLogsRepository,
    },
    LogUserAction,
  ],
  exports: [
    UserLogsRepository,
    LogUserAction,
    MongodbService,
    HttpClient,
    PrismaService,
    EmailService,
  ],
})
export class SharedModule {}
