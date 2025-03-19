import { User } from "@/modules/identity/domain/entities/User";
import { UserRoles } from "@/modules/identity/domain/enums/user-roles";
import { Prisma, User as PrismaUser } from "@prisma/client";

export class UserAssembler {
  public static fromPrisma(prismaData?: PrismaUser | null): User | null {
    if (!prismaData) return null;

    return new User({
      id: prismaData.id,
      uuid: prismaData.uuid,
      email: prismaData.email ?? null,
      name: prismaData.name ?? null,
      role: prismaData.role as UserRoles,
      ipAddress: prismaData.ipAddress ?? null,
      deviceKey: prismaData.deviceKey ?? null,
      deviceInfo: prismaData.deviceInfo as Record<string, unknown> | null,
      credentials: [],
    });
  }

  public static toPrismaCreateInput(user: User): Prisma.UserCreateInput {
    return {
      uuid: user.uuid,
      email: user.email,
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
      email: user.email ?? undefined,
      name: user.name ?? undefined,
      role: user.role ?? undefined,
      ipAddress: user.ipAddress ?? undefined,
      deviceKey: user.deviceKey ?? undefined,
      deviceInfo: (user.deviceInfo ?? undefined) as
        | Prisma.NullableJsonNullValueInput
        | Prisma.InputJsonValue
        | undefined,
    };
  }
}
