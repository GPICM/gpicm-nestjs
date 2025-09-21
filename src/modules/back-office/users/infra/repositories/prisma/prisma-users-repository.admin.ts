import { PrismaService } from "@/modules/shared/services/prisma-services";

import { Inject, Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { User } from "../../../domain/entites/User";
import {
  UserAdminAssembler,
  userAdminInclude,
} from "./mappers/prisma-user.assembler.admin";
import {
  BaseRepositoryFindManyResult,
  UserFindManyFilters,
  UsersAdminRepository,
} from "../../../domain/interfaces/users-repository";

@Injectable()
export class PrismaUserAdminRepository implements UsersAdminRepository {
  private readonly logger: Logger = new Logger(PrismaUserAdminRepository.name);

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService
  ) {}

  public async listAll(
    filters: UserFindManyFilters
  ): Promise<BaseRepositoryFindManyResult<User>> {
    try {
      this.logger.log("Staging to list posts", { filters });
      const skip = filters.offset ?? 0;
      const take = filters.limit ?? 10;
      const sort = filters.sort ?? "createdAt";
      const order = filters.order?.toUpperCase() === "ASC" ? "ASC" : "DESC";

      const where: Prisma.UserWhereInput = {};

      if (filters.status) {
        where["status"] = { equals: filters.status };
      }

      if (filters.role) {
        where["role"] = { equals: filters.role };
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
}
