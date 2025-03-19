import { Global, Module, Scope } from "@nestjs/common";
import { MongodbService } from "./services/mongodb-service";
import { MongoClient } from "mongodb";
import { HttpClient } from "./domain/interfaces/http-client/http-client";
import { AxiosHttpClient } from "./infra/lib/axios/axios-http-client";
import { PrismaService } from "./services/prisma-services";

const MONGO_DB_URI = String(process.env.MONGO_DB_URI);

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    MongodbService,
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
  ],
  exports: [MongodbService, HttpClient],
})
export class SharedModule {}
