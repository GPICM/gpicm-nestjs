import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export class StationMetricsReport {
  id: number;

  temperature: number | null;

  airHumidity: number | null;

  rainVolume: number | null;

  windSpeed: number | null;

  windDirection: number | null;

  windGust: number | null;

  recordDate: Date;

  minTemperature: number;

  maxTemperature: number;

  rainVolumeAcc1hr: number;

  rainVolumeAcc24hr: number;

  isOnline: boolean;

  constructor(props: NonFunctionProperties<StationMetricsReport>) {
    Object.assign(this, props);
  }
}
