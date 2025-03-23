import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export class UserLog {
  public id?: number;
  public userId: number;
  public action: string;
  public message: string;

  constructor(args: NonFunctionProperties<UserLog>) {
    Object.assign(this, args);
  }
}
