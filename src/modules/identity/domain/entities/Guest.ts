import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { User } from "./User";
import { UserRoles } from "../enums/user-roles";

export class Guest extends User {
  constructor(args: NonFunctionProperties<User>) {
    super(args);
  }

  public upgrade(email: string, name: string) {
    if (this.isGuest()) {
      throw new Error("Cannot upgrade a non guest user");
    }
    this.setRole(UserRoles.USER);
    this.setName(name);
    this.credentials = [];
  }
}
