import { Prisma } from "@prisma/client";
import { User } from "@/modules/identity/domain/entities/User";
import { UserCredential } from "@/modules/identity/authentication/domain/entities/UserCredential";
import { AuthProviders } from "@/modules/identity/domain/enums/auth-provider";
import { UserRoles } from "@/modules/identity/domain/enums/user-roles";
import { UserStatus } from "@/modules/identity/domain/enums/user-status";
import { MediaSource } from "@/modules/assets/domain/object-values/media-source";
import { UserAvatar } from "@/modules/identity/domain/value-objects/user-avatar";

export const userInclude = Prisma.validator<Prisma.UserInclude>()({
  Credentials: true,
});

type UserJoinModel = Prisma.UserGetPayload<{
  include: typeof userInclude;
}>;

export class UserAssembler {
  public static fromPrisma(prismaData?: UserJoinModel | null): User | null {
    if (!prismaData) return null;

    let credentials: UserCredential[] = [];

    if (prismaData.Credentials?.length) {
      credentials = prismaData.Credentials.map((cred) => {
        return new UserCredential({
          email: cred.email,
          externalId: cred.externalId,
          isPrimary: cred.isPrimary,
          lastPasswordChangeAt: cred.lastPasswordChangeAt,
          passwordHash: cred.passwordHash,
          provider: cred.provider as AuthProviders,
          temporaryPasswordExpiresAt: cred.temporaryPasswordExpiresAt,
          temporaryPasswordHash: cred.temporaryPasswordHash,
          userId: cred.userId,
          isVerified: cred.isVerified,
        });
      });
    }

    let avatar: UserAvatar | null = null;
    if (prismaData.avatarImageSources) {
      const avatarImageSource = MediaSource.fromJSON(
        prismaData.avatarImageSources as Record<string, unknown> | null
      );

      if (avatarImageSource) {
        avatar = new UserAvatar(avatarImageSource);
      }
    }

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
      status: prismaData.status as UserStatus,
      latitude: prismaData.latitude,
      longitude: prismaData.longitude,
      locationUpdatedAt: prismaData.locationUpdatedAt,
      credentials,
      avatar,
      createdAt: prismaData.createdAt,
      updateAt: prismaData.updatedAt,
    });
  }

  public static toPrismaCreateInput(user: User): Prisma.UserCreateInput {
    const avatarImageSourceJSON = user.avatar
      ? user.avatar.getImageSource()?.toJSON()
      : undefined;

    return {
      publicId: user.publicId,
      bio: user.bio,
      birthDate: user.birthDate,
      gender: user.gender,
      isVerified: user.isVerified,
      phoneNumber: user.phoneNumber,
      status: user.status,
      name: user.name,
      role: user.role,
      ipAddress: user.ipAddress,
      deviceKey: user.deviceKey,
      avatarUrl: user.avatar?.getAvatarUrl() || "",
      avatarImageSources: avatarImageSourceJSON as
        | Prisma.NullableJsonNullValueInput
        | Prisma.InputJsonValue
        | undefined,
      deviceInfo: (user.deviceInfo ?? undefined) as
        | Prisma.NullableJsonNullValueInput
        | Prisma.InputJsonValue
        | undefined,
    };
  }

  public static toPrismaUpdateInput(user: User): Prisma.UserUpdateInput {
    const avatarImageSourceJSON = user.avatar
      ? user.avatar.getImageSource()?.toJSON()
      : undefined;

    return {
      bio: user.bio,
      birthDate: user.birthDate,
      gender: user.gender,
      phoneNumber: user.phoneNumber,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified,
      status: user.status,
      ipAddress: user.ipAddress,
      lastLoginAt: user.lastLoginAt,
      avatarUrl: user.avatar?.getAvatarUrl() || "",
      avatarImageSources: avatarImageSourceJSON as
        | Prisma.NullableJsonNullValueInput
        | Prisma.InputJsonValue
        | undefined,
      deviceKey: user.deviceKey,
      deviceInfo: (user.deviceInfo ?? undefined) as
        | Prisma.NullableJsonNullValueInput
        | Prisma.InputJsonValue
        | undefined,
    };
  }
}
