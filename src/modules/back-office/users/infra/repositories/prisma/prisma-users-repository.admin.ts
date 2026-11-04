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
      const sort = filters.sort ?? "lastLoginAt";
      const order = filters.order?.toUpperCase() === "ASC" ? "asc" : "desc";

      const where: Prisma.UserWhereInput = {};

      if (filters.statusIn?.length) {
        where["status"] = { in: filters.statusIn };
      }

      if (filters.roleIn?.length) {
        where["role"] = { in: filters.roleIn };
      }

      const and: Prisma.UserWhereInput[] = [];

      // MySQL compara sem diferenciar maiúsculas pela collation padrão.
      const search = filters.search?.trim();
      if (search) {
        and.push({
          OR: [
            { name: { contains: search } },
            { Credentials: { some: { email: { contains: search } } } },
            { Profile: { is: { handle: { contains: search } } } },
            { Profile: { is: { displayName: { contains: search } } } },
          ],
        });
      }

      if (filters.verified === true) and.push({ isVerified: true });
      if (filters.verified === false) {
        and.push({ OR: [{ isVerified: false }, { isVerified: null }] });
      }

      const daysAgo = (days: number) =>
        new Date(Date.now() - days * 86_400_000);
      switch (filters.activity) {
        case "7d":
          and.push({ lastLoginAt: { gte: daysAgo(7) } });
          break;
        case "30d":
          and.push({ lastLoginAt: { gte: daysAgo(30) } });
          break;
        case "90d":
          and.push({ lastLoginAt: { gte: daysAgo(90) } });
          break;
        case "inactive90":
          and.push({ lastLoginAt: { lt: daysAgo(90) } });
          break;
        case "never":
          and.push({ lastLoginAt: null });
          break;
      }

      if (filters.createdFrom || filters.createdTo) {
        and.push({
          createdAt: {
            ...(filters.createdFrom && { gte: filters.createdFrom }),
            ...(filters.createdTo && { lte: filters.createdTo }),
          },
        });
      }

      if (and.length) where.AND = and;

      const [prismaResult, count] = await Promise.all([
        this.prisma.user.findMany({
          where,
          take,
          skip,
          orderBy: [{ [sort]: order }, { id: "asc" }],
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
        this.prisma.user.count({ where: { status: "PENDING" } }),
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
