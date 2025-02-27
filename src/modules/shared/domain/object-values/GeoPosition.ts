export class GeoPosition {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;

  constructor(
    latitude: number,
    longitude: number,
    altitude?: number,
    accuracy?: number,
  ) {
    if (!GeoPosition.isValidLatitude(latitude)) {
      throw new Error(
        `Invalid latitude: ${latitude}. Latitude must be between -90 and 90.`,
      );
    }

    if (!GeoPosition.isValidLongitude(longitude)) {
      throw new Error(
        `Invalid longitude: ${longitude}. Longitude must be between -180 and 180.`,
      );
    }

    this.latitude = latitude;
    this.longitude = longitude;
    this.altitude = altitude;
    this.accuracy = accuracy;
  }

  static isValidLatitude(latitude: number): boolean {
    return latitude >= -90 && latitude <= 90;
  }

  static isValidLongitude(longitude: number): boolean {
    return longitude >= -180 && longitude <= 180;
  }

  toJSON() {
    return {
      latitude: this.latitude,
      longitude: this.longitude,
      altitude: this.altitude,
      accuracy: this.accuracy,
    };
  }

  static fromJSON(json: Record<string, number>): GeoPosition {
    return new GeoPosition(
      json.latitude,
      json.longitude,
      json.altitude,
      json.accuracy,
    );
  }
}
