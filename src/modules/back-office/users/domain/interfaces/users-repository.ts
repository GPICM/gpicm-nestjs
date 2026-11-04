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
  verified?: boolean;
  /** Janela de último acesso: 7d/30d/90d = acessou no período; inactive90 = sem acesso há 90 dias; never = nunca acessou. */
  activity?: "7d" | "30d" | "90d" | "inactive90" | "never";
  createdFrom?: Date;
  createdTo?: Date;
}

export * from "./dto/base-repository-filters";
