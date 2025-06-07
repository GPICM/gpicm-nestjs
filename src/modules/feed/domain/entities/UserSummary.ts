import { User } from "@/modules/identity/domain/entities/User";
import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export class UserSummary {
  id: number;
  name: string;
  publicId: string;
  profilePicture: string;

  constructor(args: NonFunctionProperties<UserSummary>) {
    Object.assign(this, args);
  }

  public static fromUser(user: User): UserSummary {
    return new UserSummary({
      id: user.id!,
      name: user.name!,
      profilePicture: user.profilePicture ?? "",
      publicId: user.publicId,
    });
  }
}
