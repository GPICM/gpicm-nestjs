import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { User } from "./User";
import { UserRoles } from "../enums/user-roles";
import { UserCredential } from "../../authentication/domain/entities/UserCredential";

export class Guest extends User {
  constructor(args: NonFunctionProperties<User>) {
    super(args);
  }

  public upgrade(
    name: string,
    email: string,
    password: string
  ): UserCredential {
    if (!this.isGuest() || !this.id) {
      throw new Error("Cannot upgrade a non guest user");
    }

    this.setName(name);

    this.setRole(UserRoles.USER);

    const newCredential = UserCredential.CreateEmailPasswordCredential(
      this.id,
      email,
      password
    );

    this.addCredentials(newCredential);

    return newCredential;
  }
}
