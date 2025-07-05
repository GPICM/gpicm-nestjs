import { User } from "@/modules/identity/domain/entities/User";
import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export class UserShallow {
  id: number;
  name: string;
  publicId: string;

  constructor(args: NonFunctionProperties<UserShallow>) {
    Object.assign(this, args);
  }

  public static fromUser(user: User): UserShallow {
    return new UserShallow({
      id: user.id!,
      name: user.name!,
      publicId: user.publicId,
    });
  }

  public toJSON() {
    const serialized: Record<string, unknown> = { ...this } as Record<
      string,
      unknown
    >;
    delete serialized.id;
    return serialized;
  }
}
