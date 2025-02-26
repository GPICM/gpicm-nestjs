import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from "@nestjs/common";

async function bootstrap(): Promise<INestApplication<any>> {
  console.log(`Identity App\n`);

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    })
  );

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: "api/v",
    defaultVersion: "1",
  });

  app.enableCors({
    origin: "*",
  });

  return app;
}

async function main() {
  const app = await bootstrap();
  await app.listen(process.env.PORT ?? 9000);
}

main();
