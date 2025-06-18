import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export enum PolicyType {
  TERMS_OF_SERVICE = "TERMS_OF_SERVICE",
  PRIVACY_POLICY = "PRIVACY_POLICY",
  DATA_USAGE_POLICY = "DATA_USAGE_POLICY",
}

export class Policies {
  id: string;
  version: string;
  type: PolicyType;
  content: string;
  htmlContent: string;
  createdAt: Date;
  deletedAt: Date | null;

  constructor(args: NonFunctionProperties<Policies>) {
    Object.assign(this, args);
  }
}
