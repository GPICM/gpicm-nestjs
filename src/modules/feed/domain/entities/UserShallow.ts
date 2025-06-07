import { User } from "@/modules/identity/domain/entities/User";
import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export class UserShallow {
  id: number;
  name: string;
  publicId: string;
  profilePicture: string;

  constructor(args: NonFunctionProperties<UserShallow>) {
    Object.assign(this, args);
  }

  public static fromUser(user: User): UserShallow {
    return new UserShallow({
      id: user.id!,
      name: user.name!,
      profilePicture: user.profilePicture ?? "",
      publicId: user.publicId,
    });
  }
}
