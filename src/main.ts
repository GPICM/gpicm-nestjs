/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";

import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from "@nestjs/common";
import { winstonLogger, logtail } from "./logger";
import { LoggerMiddleware } from "./modules/shared/LoggerMiddleware";

const projectName = `
.d8888b.  8888888b. 8888888 .d8888b.  888b     d888 
d88P  Y88b 888   Y88b  888  d88P  Y88b 8888b   d8888 
888    888 888    888  888  888    888 88888b.d88888
888        888   d88P  888  888        888Y88888P888 
888  88888 8888888P"   888  888        888 Y888P 888 
888    888 888         888  888    888 888  Y8P  888 
Y88b  d88P 888         888  Y88b  d88P 888   "   888 
"Y8888P88 888       8888888 "Y8888P"  888       888                                                                                                                                                                
`;
async function bootstrap(): Promise<INestApplication<any>> {
  console.log(projectName);

  const logger =
    String(process.env.NODE_ENV) === "production" ? winstonLogger : console;

  const app = await NestFactory.create(AppModule, { logger });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors({ origin: "*" });

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: "api/v",
    defaultVersion: "1",
  });

  return app;
}

async function main() {
  const app = await bootstrap();

  // Graceful shutdown
  app.enableShutdownHooks();

  process.on("SIGINT", async () => {
    console.log("SIGINT received, flushing logs...");
    await logtail.flush(); // flush Logs
    process.exit(0);
  });

  app.use(new LoggerMiddleware().use);

  // --- Start HTTP server ---
  const port = process.env.PORT ?? 9000;
  await app.listen(port);
  console.log(`HTTP server listening on port ${port}...`);

  // --- Connect Redis microservice ---
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST ?? "redis",
      port: Number(process.env.REDIS_PORT ?? 6379),
      wildcards: true,
    },
  });

  // --- Start all microservices ---
  await app.startAllMicroservices();
  console.log("Redis microservice listening for events...");
}

main();
