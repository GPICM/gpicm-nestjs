import { PrismaBaseRepository } from "@/modules/shared/infra/repositories/prisma-base-repository";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { Prisma, User as PrismaUser } from "@prisma/client";
import { UsersRepository } from "../../domain/interfaces/repositories/users-repository";
import { User } from "../../domain/entities/User";
import { UserRoles } from "../../domain/enums/user-roles";
import { UserAssembler } from "./mappers/prisma-user.assembler";
import { Logger } from "@nestjs/common";

export class PrismaUserRepository
  extends PrismaBaseRepository<PrismaUser>
  implements UsersRepository
{
  private readonly logger: Logger = new Logger(PrismaUserRepository.name);

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findUserByDeviceKey(
    deviceKey: string,
    filters: { roles?: UserRoles[] }
  ): Promise<User | null> {
    try {
      this.logger.log(`Finding user by device key: ${deviceKey}`);

      const conditions: string[] = [`device_key = ${deviceKey}`];
      if (filters.roles?.length) {
        const rolesStr = filters?.roles.join(", ");
        conditions.push(`role IN (${rolesStr}) `);
      }

      const query = Prisma.sql` SELECT * FROM users WHERE ${conditions.join(" AND ")} `;
      const result = await this._findOne(query, [deviceKey]);
      return UserAssembler.fromPrisma(result);
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
      const query = Prisma.sql`
        SELECT * FROM users 
        WHERE uuid = $1 
        AND deleted_at IS NULL 
        LIMIT 1
      `;
      const result = await this._findOne(query, [uuid]);
      return UserAssembler.fromPrisma(result);
    } catch (error: unknown) {
      this.logger.error(`Failed to find user by UUID: ${uuid}`, { error });
      throw new Error("Error retrieving user by UUID");
    }
  }

  public async add(user: User): Promise<void> {
    try {
      this.logger.log(`Adding user with UUID: ${user.uuid}`);
      const createInput = UserAssembler.toPrismaCreateInput(user);

      const query = Prisma.sql`
        INSERT INTO users (uuid, name, email, role, ip_address, device_key, device_info)
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *;
      `;

      await this._create(query, [
        createInput.uuid,
        createInput.name,
        createInput.email,
        createInput.role,
        createInput.ipAddress,
        createInput.deviceKey,
        createInput.deviceInfo,
      ]);
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
      const updateInput = UserAssembler.toPrismaUpdateInput(user);

      const query = Prisma.sql`
        UPDATE users 
        SET name = $1, email = $2, role = $3, ip_address = $4, device_key = $5, device_info = $6, updated_at = NOW()
        WHERE uuid = $7 AND deleted_at IS NULL 
        RETURNING *;
      `;
      const params = [
        updateInput.name,
        updateInput.email,
        updateInput.role,
        updateInput.ipAddress,
        updateInput.deviceKey,
        updateInput.deviceInfo,
        user.uuid,
      ];

      await this._update(query, params);
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
      await this._softDelete("users", id);
    } catch (error: unknown) {
      this.logger.error(`Failed to delete user with ID: ${id}`, { error });
      throw new Error("Error deleting user");
    }
  }
}
