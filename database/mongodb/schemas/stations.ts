import { Db, ObjectId } from "mongodb";

export interface MongoGeoPosition {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface MongoStation {
  _id: ObjectId;
  slug: string;
  internalId: number;
  address: string;
  description: string;
  geoPosition: MongoGeoPosition | null;
  isActive: boolean;
  observation: string;
  isOnline: boolean;
  syncedAt: Date;
}
