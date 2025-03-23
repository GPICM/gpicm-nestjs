import { User } from "../../entities/User";
import { UserRoles } from "../../enums/user-roles";

export abstract class UsersRepository {
  abstract findByPublicId(
    uuid: string,
    filters?: { roles?: UserRoles[] }
  ): Promise<User | null>;

  abstract findUserByDeviceKey(
    deviceKey: string,
    filters: { roles?: UserRoles[] }
  ): Promise<User | null>;

  abstract add(user: User, tx?: unknown): Promise<number>;

  abstract update(user: User, tx?: unknown): Promise<void>;

  abstract delete(userId: number): Promise<void>;
}
