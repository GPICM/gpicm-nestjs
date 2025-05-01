import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export class PartnerApiKey {
  public id: number;
  public key: string;
  public partnerId: number;

  constructor(args: NonFunctionProperties<PartnerApiKey>) {
    Object.assign(this, args);
  }
}
