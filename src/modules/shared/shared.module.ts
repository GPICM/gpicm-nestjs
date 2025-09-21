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
import { NodemailerEmailService } from "./infra/lib/nodemailer/nodemailer-email-service";
import { RedisAdapter } from "./infra/lib/redis/redis-adapter";
import { RedisLockService } from "./infra/lib/redis/redis-lock-service";
import { RedisPubSubService } from "./infra/lib/redis/redis-pub-sub-service";
import { RedisEventPublisher } from "./infra/lib/redis/redis-event-publisher";
import { EventPublisher } from "./domain/interfaces/application-event-publisher";

const MONGO_DB_URI = String(process.env.MONGO_DB_URI);

@Global()
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
    }),
  ],
  controllers: [],
  providers: [
    MongodbService,
    {
      provide: EmailService,
      useClass: NodemailerEmailService,
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
    {
      provide: EventPublisher,
      useClass: RedisEventPublisher,
    },
    LogUserAction,
    RedisAdapter,
    RedisLockService,
    RedisPubSubService,
  ],
  exports: [
    UserLogsRepository,
    LogUserAction,
    MongodbService,
    HttpClient,
    PrismaService,
    EmailService,
    RedisLockService,
    RedisAdapter,
    EventPublisher,
  ],
})
export class SharedModule {}
