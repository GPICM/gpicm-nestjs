import { PrismaService } from "@/modules/shared/services/prisma-services";
import { UsersRepository } from "../../domain/interfaces/repositories/users-repository";
import { User } from "../../domain/entities/User";
import { UserRoles } from "../../domain/enums/user-roles";
import { UserAssembler, userInclude } from "./mappers/prisma-user.assembler";
import { Inject, Logger } from "@nestjs/common";
import { AuthProviders, PrismaClient } from "@prisma/client";
import { UpdateUserDataDto, UserBasicDataDto } from "../../presentation/dtos/user-request.dtos";

export class PrismaUserRepository implements UsersRepository {
  private readonly logger: Logger = new Logger(PrismaUserRepository.name);

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService
  ) {}

  public async findByCredentials(
    provider: AuthProviders,
    filters: { email: string }
  ): Promise<User | null> {
    try {
      this.logger.log(`Finding user by credentials`, { provider, filters });

      const result = await this.prisma.user.findFirst({
        where: {
          Credentials: {
            some: {
              email: filters.email,
            },
          },
        },
        include: userInclude,
      });

      return UserAssembler.fromPrisma(result);
    } catch (error: unknown) {
      this.logger.error(`Failed to find user by device key`, {
        error,
      });
      throw new Error("Error retrieving user by device key");
    }
  }

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
        include: userInclude,
      });

      return user ? UserAssembler.fromPrisma(user) : null;
    } catch (error: unknown) {
      this.logger.error(`Failed to find user by device key: ${deviceKey}`, {
        error,
      });
      throw new Error("Error retrieving user by device key");
    }
  }

  public async findByPublicId(publicId: string): Promise<User | null> {
    try {
      this.logger.log(`Finding user by UUID: ${publicId}`);
      const user = await this.prisma.user.findUnique({
        where: { publicId },
        include: userInclude,
      });

      return user ? UserAssembler.fromPrisma(user) : null;
    } catch (error: unknown) {
      this.logger.error(`Failed to find user by UUID: ${publicId}`, { error });
      throw new Error("Error retrieving user by UUID");
    }
  }

  public async getSpecificUserBasicData(publicId: string): Promise<UserBasicDataDto | null> {
    try {
      this.logger.log(`Fetching specific basic user data for publicId: ${publicId}`);

      const prismaUser = await this.prisma.user.findUnique({
        where: { publicId },
        select: {
          name: true,
          bio: true,
          profilePicture: true,
          gender: true,
          birthDate: true,
          phoneNumber: true,
          createdAt: true,
          updatedAt: true,
          // Se você realmente precisar do email:
          Credentials: {
            select: {
              email: true,
            },
            take: 1 // Pega apenas um, se houver múltiplos
          },
        },
      });

      if (!prismaUser) {
        this.logger.log(`User with publicId ${publicId} not found for basic data retrieval.`);
        return null;
      }

      // Mapeia os dados brutos do Prisma para o UserBasicDataDto
      const basicData: UserBasicDataDto = {
        name: prismaUser.name,
        bio: prismaUser.bio,
        profilePicture: prismaUser.profilePicture,
        gender: prismaUser.gender,
        birthDate: prismaUser.birthDate,
        phoneNumber: prismaUser.phoneNumber,
        createdAt: prismaUser.createdAt,
        updatedAt: prismaUser.updatedAt,
        // Se o email for buscado via `include`, você o acessaria assim:
        email: prismaUser.Credentials?.[0]?.email,
      };

      this.logger.log(`Specific basic data fetched for publicId: ${publicId}`);
      return basicData;
    } catch (error: unknown) {
      this.logger.error(`Failed to fetch specific basic user data for publicId: ${publicId}`, { error });
      throw new Error("Error retrieving specific basic user data");
    }
  }

  public async add(user: User, tx?: PrismaClient): Promise<number> {
    try {
      const connection = this.prisma.getConnection() ?? tx;
      this.logger.log(`Adding user with public id: ${user.publicId}`);

      const result = await connection.user.create({
        data: UserAssembler.toPrismaCreateInput(user),
      });

      return result.id;
    } catch (error: unknown) {
      this.logger.error(`Failed to add user with public id: ${user.publicId}`, {
        error,
      });
      throw new Error("Error adding user");
    }
  }

  public async update(user: User, tx?: PrismaClient): Promise<void> {
    try {
      this.logger.log(`Updating user with UUID: ${user.publicId}`);
      const connection = this.prisma.getConnection() ?? tx;

      await connection.user.update({
        where: { id: user.id },
        data: UserAssembler.toPrismaUpdateInput(user),
      });
    } catch (error: unknown) {
      this.logger.error(`Failed to update user with UUID: ${user.publicId}`, {
        error,
      });
      throw new Error("Error updating user");
    }
  }

  public async updateUserData(user: User, userData: UpdateUserDataDto): Promise<void>{
    try{
      await this.prisma.user.update({
        where: { id: user.id },
        data: userData,
      });

      this.logger.log(`PrismaUserRepository: Dados do usuário ID ${user.id} atualizados com sucesso no banco de dados.`);

    } catch (error: unknown){
      this.logger.error(`Failed to update user data: ${user.publicId}`, {
        error,
      });
      throw new Error("Error updating user data");
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

  async updateLocation(
    userId: number,
    lat: number,
    lng: number
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        latitude: lat,
        longitude: lng,
        locationUpdatedAt: new Date(),
      },
    });
  }
}
