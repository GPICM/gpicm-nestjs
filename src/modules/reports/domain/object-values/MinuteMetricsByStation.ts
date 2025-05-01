export interface MinuteMetricsByStation {
  stationId: string;
  stationName: string;
  observation: {
    timestamp: Date;
    temperature: number | null; // °C  latestTemperature
    airHumidity: number | null; // latestAirHumidity
    rainVolume: number | null; // mm // latestRainVolume
    windSpeed: number | null; // m/s // latestWindSpeed
    windDirection: number | null; // ° // latestWindDirection
    windGust: number | null; // m/s
    atmosphericPressure: number | null; // hPa
  };
  statistics: {
    minTemperature: number | null;
    maxTemperature: number | null;
    rainVolumeAcc: number | null;
    totalObservations: number;
  };
}
