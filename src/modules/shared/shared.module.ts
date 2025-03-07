import { Global, Module } from "@nestjs/common";
import { MongodbService } from "./services/mongodb-service";
import { MongoClient } from "mongodb";

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
  ],
  exports: [MongodbService],
})
export class SharedModule {}
