import { Global, Module } from "@nestjs/common";
import { MongodbService } from "./services/mongodb-service";
import { MongoClient } from "mongodb";
import { HttpClient } from "./domain/interfaces/http-client/http-client";
import { AxiosHttpClient } from "./services/lib/axios/axios-http-client";

const MONGO_DB_URI = String(process.env.MONGO_DB_URI);

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    MongodbService,
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
    },
  ],
  exports: [MongodbService],
})
export class SharedModule {}
