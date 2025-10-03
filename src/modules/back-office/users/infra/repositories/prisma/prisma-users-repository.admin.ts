import { PrismaService } from "@/modules/shared/services/prisma-services";

import { Inject, Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import {
  UserAdminAssembler,
  userAdminInclude,
} from "./mappers/prisma-user.assembler.admin";
import {
  BaseRepositoryFindManyResult,
  UserFindManyFilters,
  UsersAdminRepository,
} from "../../../domain/interfaces/users-repository";
import { ManagedUser } from "../../../domain/entites/ManagedUser";
import { UserCountSummary } from "../../../domain/views/UserCountSummary";

@Injectable()
export class PrismaUserAdminRepository implements UsersAdminRepository {
  private readonly logger: Logger = new Logger(PrismaUserAdminRepository.name);

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService
  ) {}

  public async listAll(
    filters: UserFindManyFilters
  ): Promise<BaseRepositoryFindManyResult<ManagedUser>> {
    try {
      this.logger.log("Staging to list posts", { filters });
      const skip = filters.offset ?? 0;
      const take = filters.limit ?? 10;
      const sort = filters.sort ?? "createdAt";
      const order = filters.order?.toUpperCase() === "ASC" ? "asc" : "desc";

      const where: Prisma.UserWhereInput = {};

      if (filters.statusIn?.length) {
        where["status"] = { in: filters.statusIn };
      }

      if (filters.roleIn?.length) {
        where["role"] = { in: filters.roleIn };
      }

      const [prismaResult, count] = await Promise.all([
        this.prisma.user.findMany({
          where,
          take,
          skip,
          orderBy: { [sort]: order },
          include: userAdminInclude,
        }),
        this.prisma.user.count({ where }),
      ]);

      const records = prismaResult
        .map((u) => UserAdminAssembler.fromPrisma(u))
        .filter((u) => !!u);

      return { records, count };
    } catch (error: unknown) {
      console.log(error);
      this.logger.error("Failed to list posts", { error });
      throw new Error("Failed to list posts");
    }
  }

  public async getCountSummary(): Promise<UserCountSummary> {
    try {
      const [
        total,
        pendingProfileCount,
        guestCount,
        activeCount,
        adminCount,
        bannedCount,
        suspendedCount,
      ] = await Promise.all([
        this.prisma.user.count({}),
        this.prisma.user.count({ where: { status: "PENDING_PROFILE" } }),
        this.prisma.user.count({ where: { status: "GUEST" } }),
        this.prisma.user.count({ where: { status: "ACTIVE" } }),
        this.prisma.user.count({ where: { role: "ADMIN" } }),
        this.prisma.user.count({ where: { status: "BANNED" } }),
        this.prisma.user.count({ where: { status: "SUSPENDED" } }),
      ]);

      return new UserCountSummary({
        total,
        activeCount,
        adminCount,
        guestCount,
        pendingProfileCount,
        bannedCount,
        suspendedCount,
      });
    } catch (error: unknown) {
      this.logger.error("Faield to load count summary");
      throw error;
    }
  }
}
