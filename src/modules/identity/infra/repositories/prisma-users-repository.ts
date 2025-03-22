import { PrismaService } from "@/modules/shared/services/prisma-services";
import { UsersRepository } from "../../domain/interfaces/repositories/users-repository";
import { User } from "../../domain/entities/User";
import { UserRoles } from "../../domain/enums/user-roles";
import { UserAssembler } from "./mappers/prisma-user.assembler";
import { Inject, Logger } from "@nestjs/common";

export class PrismaUserRepository implements UsersRepository {
  private readonly logger: Logger = new Logger(PrismaUserRepository.name);

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService
  ) {}

  async findUserByDeviceKey(
    deviceKey: string,
    filters: { roles?: UserRoles[] }
  ): Promise<User | null> {
    try {
      this.logger.log(`Finding user by device key: ${deviceKey}`);

      const user = await this.prisma.user.findFirst({
        where: {
          deviceKey,
          role: filters.roles ? { in: filters.roles } : undefined,
        },
      });

      return user ? UserAssembler.fromPrisma(user) : null;
    } catch (error: unknown) {
      this.logger.error(`Failed to find user by device key: ${deviceKey}`, {
        error,
      });
      throw new Error("Error retrieving user by device key");
    }
  }

  public async findByUuid(uuid: string): Promise<User | null> {
    try {
      this.logger.log(`Finding user by UUID: ${uuid}`);
      const user = await this.prisma.user.findUnique({
        where: { uuid },
      });
      return user ? UserAssembler.fromPrisma(user) : null;
    } catch (error: unknown) {
      this.logger.error(`Failed to find user by UUID: ${uuid}`, { error });
      throw new Error("Error retrieving user by UUID");
    }
  }

  public async add(user: User): Promise<void> {
    try {
      this.logger.log(`Adding user with UUID: ${user.uuid}`);
      await this.prisma.user.create({
        data: UserAssembler.toPrismaCreateInput(user),
      });
    } catch (error: unknown) {
      this.logger.error(`Failed to add user with UUID: ${user.uuid}`, {
        error,
      });
      throw new Error("Error adding user");
    }
  }

  public async update(user: User): Promise<void> {
    try {
      this.logger.log(`Updating user with UUID: ${user.uuid}`);
      await this.prisma.user.update({
        where: { uuid: user.uuid },
        data: UserAssembler.toPrismaUpdateInput(user),
      });
    } catch (error: unknown) {
      this.logger.error(`Failed to update user with UUID: ${user.uuid}`, {
        error,
      });
      throw new Error("Error updating user");
    }
  }

  public async delete(id: number): Promise<void> {
    try {
      this.logger.log(`Deleting user with ID: ${id}`);
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error: unknown) {
      this.logger.error(`Failed to delete user with ID: ${id}`, { error });
      throw new Error("Error deleting user");
    }
  }
}
