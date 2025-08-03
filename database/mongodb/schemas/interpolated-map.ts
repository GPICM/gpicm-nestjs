import { ObjectId } from "mongodb";

export const MONGO_INTERPOLATED_MAP_COLLECTION_NAME = "interpolated_map";

export interface MongoInterpolatedMap {
  _id: ObjectId;
  interval: Date;
  timestamp: Date;
  field: string;
  geojson_compressed: string;
}
