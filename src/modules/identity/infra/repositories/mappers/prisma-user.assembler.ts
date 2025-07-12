import { Guest } from "@/modules/identity/domain/entities/Guest";
import { User } from "@/modules/identity/domain/entities/User";
import { UserCredential } from "@/modules/identity/domain/entities/UserCredential";
import { AuthProviders } from "@/modules/identity/domain/enums/auth-provider";
import { UserRoles } from "@/modules/identity/domain/enums/user-roles";
import { UserStatus } from "@/modules/identity/domain/enums/user-status";
import { Prisma } from "@prisma/client";

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
          emailIsVerified: cred.emailIsVerified,
          emailVerificationToken: cred.emailVerificationToken,
          expiresAt: cred.expiresAt,
        });
      });
    }

    if (prismaData.role === "GUEST") {
      return new Guest({
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
        latitude: prismaData.latitude,
        longitude: prismaData.longitude,
        locationUpdatedAt: prismaData.locationUpdatedAt,
        credentials: [],
      });
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
      profilePicture: prismaData.profilePicture,
      status: prismaData.status as UserStatus,
      latitude: prismaData.latitude,
      longitude: prismaData.longitude,
      locationUpdatedAt: prismaData.locationUpdatedAt,
      credentials,
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
