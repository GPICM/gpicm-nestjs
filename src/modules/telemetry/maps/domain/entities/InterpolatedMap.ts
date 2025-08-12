import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export class InterpolatedMap {
  id: string;

  field: string;

  interval: Date;

  timeStamp: Date;

  geojsonCompressed: any;

  constructor(props: NonFunctionProperties<InterpolatedMap>) {
    Object.assign(this, props);
  }
}
