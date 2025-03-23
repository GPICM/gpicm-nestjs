import { User } from "@/modules/identity/domain/entities/User";
import { UserRoles } from "@/modules/identity/domain/enums/user-roles";
import { UserStatus } from "@/modules/identity/domain/enums/user-status";
import { Prisma, User as PrismaUser } from "@prisma/client";

export class UserAssembler {
  public static fromPrisma(prismaData?: PrismaUser | null): User | null {
    if (!prismaData) return null;

    return new User({
      id: prismaData.id,
      publicId: prismaData.publicId,
      name: prismaData.name ?? null,
      role: prismaData.role as UserRoles,
      ipAddress: prismaData.ipAddress ?? null,
      deviceKey: prismaData.deviceKey ?? null,
      deviceInfo: prismaData.deviceInfo as Record<string, unknown> | null,
      bio: prismaData.bio,
      birthDate: prismaData.birthDate,
      gender: prismaData.gender,
      isVerified: prismaData.isVerified,
      lastLoginAt: prismaData.lastLoginAt,
      phoneNumber: prismaData.phoneNumber,
      profilePicture: prismaData.profilePicture,
      status: prismaData.status as UserStatus,
      credentials: [],
    });
  }

  public static toPrismaCreateInput(user: User): Prisma.UserCreateInput {
    return {
      publicId: user.publicId,
      bio: user.bio,
      birthDate: user.birthDate,
      gender: user.gender,
      isVerified: user.isVerified,
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture,
      status: user.status,
      name: user.name,
      role: user.role,
      ipAddress: user.ipAddress,
      deviceKey: user.deviceKey,
      deviceInfo: (user.deviceInfo ?? undefined) as
        | Prisma.NullableJsonNullValueInput
        | Prisma.InputJsonValue
        | undefined,
    };
  }

  public static toPrismaUpdateInput(user: User): Prisma.UserUpdateInput {
    return {
      publicId: user.publicId,
      bio: user.bio,
      birthDate: user.birthDate,
      gender: user.gender,
      isVerified: user.isVerified,
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture,
      status: user.status,
      name: user.name,
      role: user.role,
      ipAddress: user.ipAddress,
      deviceKey: user.deviceKey,
      deviceInfo: (user.deviceInfo ?? undefined) as
        | Prisma.NullableJsonNullValueInput
        | Prisma.InputJsonValue
        | undefined,
    };
  }
}
