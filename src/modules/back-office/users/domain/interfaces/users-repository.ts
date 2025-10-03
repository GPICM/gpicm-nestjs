import { UserStatus } from "@prisma/client";

import { UserRoles } from "@/modules/identity/core/domain/enums/user-roles";
import {
  BaseRepositoryFindManyFilters,
  BaseRepositoryFindManyResult,
} from "./dto/base-repository-filters";
import { Injectable } from "@nestjs/common";
import { ManagedUser } from "../entites/ManagedUser";
import { UserCountSummary } from "../views/UserCountSummary";

@Injectable()
export abstract class UsersAdminRepository {
  abstract listAll(
    filters: UserFindManyFilters
  ): Promise<BaseRepositoryFindManyResult<ManagedUser>>;

  abstract getCountSummary(): Promise<UserCountSummary>;
}

export interface UserFindManyFilters extends BaseRepositoryFindManyFilters {
  statusIn?: UserStatus[];
  roleIn?: UserRoles[];
}

export * from "./dto/base-repository-filters";
