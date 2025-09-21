import { UserStatus } from "@prisma/client";

import { User } from "../entites/User";
import { UserRoles } from "@/modules/identity/domain/enums/user-roles";
import {
  BaseRepositoryFindManyFilters,
  BaseRepositoryFindManyResult,
} from "./dto/base-repository-filters";

export abstract class UsersRepository {
  abstract listAll(
    filters: UserFindManyFilters
  ): Promise<BaseRepositoryFindManyResult<User>>;
}

export interface UserFindManyFilters extends BaseRepositoryFindManyFilters {
  status?: UserStatus;
  role?: UserRoles;
}

export * from "./dto/base-repository-filters";
