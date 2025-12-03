import { Prisma } from "@prisma/client";
import { UserRoles } from "@/modules/identity/core/domain/enums/user-roles";
import { UserStatus } from "@/modules/identity/core/domain/enums/user-status";
import { MediaSource } from "@/modules/assets/domain/object-values/media-source";
import { UserAvatar } from "@/modules/shared/domain/object-values/user-avatar";
import {
  ProfileSummary,
  ManagedUser,
} from "@/modules/back-office/users/domain/entites/ManagedUser";

export const userAdminInclude = Prisma.validator<Prisma.UserInclude>()({
  Credentials: { where: { isPrimary: true } },
  Profile: true,
});

type UserAdminJoinModel = Prisma.UserGetPayload<{
  include: typeof userAdminInclude;
}>;

export class UserAdminAssembler {
  public static fromPrisma(
    prismaData?: UserAdminJoinModel | null
  ): ManagedUser | null {
    if (!prismaData) return null;

    let avatar: UserAvatar | null = null;
    if (prismaData.avatarImageSources) {
      const avatarImageSource = MediaSource.fromJSON(
        prismaData.avatarImageSources as Record<string, unknown> | null
      );

      if (avatarImageSource) {
        avatar = new UserAvatar(avatarImageSource);
      }
    }

    let activeProfile: ProfileSummary | null = null;
    if (prismaData.Profile) {
      activeProfile = {
        id: prismaData.Profile.id,
        handle: prismaData.Profile.handle,
        displayName: prismaData.Profile.displayName,
      };
    }

    let email = "";
    if (prismaData.Credentials?.length) {
      email = prismaData.Credentials[0].email;
    }

    return new ManagedUser({
      id: prismaData.id,
      email,
      publicId: prismaData.publicId,
      name: prismaData.name ?? null,
      role: prismaData.role as UserRoles,
      gender: prismaData.gender,
      isVerified: prismaData.isVerified,
      status: prismaData.status as UserStatus,
      activeProfile,
      createdAt: prismaData.createdAt,
      updateAt: prismaData.updatedAt,
      lastLoginAt: prismaData.lastLoginAt,
      avatar,
      bio: prismaData.bio,
    });
  }
}
