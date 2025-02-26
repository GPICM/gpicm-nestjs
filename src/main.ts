import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from "@nestjs/common";

async function bootstrap(): Promise<INestApplication<any>> {
  const banner = `
 .d8888b.  8888888b. 8888888 .d8888b.  888b     d888 
d88P  Y88b 888   Y88b  888  d88P  Y88b 8888b   d8888 
888    888 888    888  888  888    888 88888b.d88888
888        888   d88P  888  888        888Y88888P888 
888  88888 8888888P"   888  888        888 Y888P 888 
888    888 888         888  888    888 888  Y8P  888 
Y88b  d88P 888         888  Y88b  d88P 888   "   888 
 "Y8888P88 888       8888888 "Y8888P"  888       888                                                                                                                                                                
 `;
  console.log(banner);

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
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
