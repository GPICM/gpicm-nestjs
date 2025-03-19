import { User } from "../../entities/User";
import { UserRoles } from "../../enums/user-roles";

export abstract class UsersRepository {
  abstract findByUuid(
    uuid: string,
    filters?: { roles?: UserRoles[] }
  ): Promise<User | null>;

  abstract findUserByDeviceKey(
    deviceKey: string,
    filters: { roles?: UserRoles[] }
  ): Promise<User | null>;

  abstract add(user: User): Promise<void>;

  abstract update(user: User): Promise<void>;

  abstract delete(userId: number): Promise<void>;
}
