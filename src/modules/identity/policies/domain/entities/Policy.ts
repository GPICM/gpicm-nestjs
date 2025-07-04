import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export enum PolicyType {
  PRIVACY_POLICY = "PRIVACY_POLICY",
  TERMS_OF_SERVICE = "TERMS_OF_SERVICE",
  DATA_USAGE_POLICY = "DATA_USAGE_POLICY",
}

export class Policy {
  public id: string;

  public version: string;

  public type: PolicyType;

  public content: string;

  public htmlContent: string;

  public createdAt: Date;

  constructor(args: NonFunctionProperties<Policy>) {
    Object.assign(this, args);
  }
}
