import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export class UserCountSummary {
  public total: number;
  public pendingProfileCount: number;
  public guestCount: number;
  public activeCount: number;
  public adminCount: number;
  public bannedCount: number;
  public suspendedCount: number;

  constructor(args: NonFunctionProperties<UserCountSummary>) {
    Object.assign(this, args);
  }
}
