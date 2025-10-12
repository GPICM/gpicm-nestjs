import { Prisma } from "@prisma/client";
import { Profile } from "@/modules/social/core/domain/entities/Profile";
import { UserAvatar } from "@/modules/shared/domain/object-values/user-avatar";
import { MediaSource } from "@/modules/assets/domain/object-values/media-source";

export const profileInclude = Prisma.validator<Prisma.ProfileInclude>()({
  User: true,
});

type ProfileJoinModel = Prisma.ProfileGetPayload<{
  include: typeof profileInclude;
}>;

export class ProfileAssembler {
  public static fromPrisma(
    prismaData?: ProfileJoinModel | null
  ): Profile | null {
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

    return new Profile({
      id: prismaData.id,
      bio: prismaData.bio || "",
      displayName: prismaData.displayName,
      followersCount: prismaData.followingCount,
      followingCount: prismaData.followersCount,
      handle: prismaData.handle,
      reputation: prismaData.reputation ?? 0,
      postsCount: prismaData.postsCount ?? 0,
      commentsCount: prismaData.commentsCount ?? 0,
      userId: prismaData.userId,
      birthDate: prismaData.User.birthDate,
      fullName: prismaData.User.name,
      gender: prismaData.User.gender,
      isUserVerified: prismaData.User.isVerified,
      lastLoginAt: prismaData.User.lastLoginAt,
      phoneNumber: prismaData.User.phoneNumber,
      avatar,
    });
  }

  public static toPrismaCreateInput(
    profile: Profile
  ): Prisma.ProfileCreateInput {
    return {
      bio: profile.bio,
      displayName: profile.displayName,
      followersCount: profile.followingCount,
      followingCount: profile.followersCount,
      handle: profile.handle,
      postsCount: profile.postsCount,
      commentsCount: profile.commentsCount,
      User: {
        connect: { id: profile.userId },
      },
    };
  }

  public static toPrismaUpdateInput(
    profile: Profile
  ): Prisma.ProfileUpdateInput {
    return {
      bio: profile.bio,
      displayName: profile.displayName,
      followersCount: profile.followingCount,
      followingCount: profile.followersCount,
      handle: profile.handle,
      postsCount: profile.postsCount,
      commentsCount: profile.commentsCount,
    };
  }

  public static toPrismaAvatarUpdateInput(
    profile: Profile
  ): Prisma.ProfileUpdateInput {
    const avatarImageSourceJSON = profile.avatar
      ? profile.avatar.getImageSource()?.toJSON()
      : undefined;

    return {
      avatarUrl: profile.avatar?.getAvatarUrl() || "",
      avatarImageSources: avatarImageSourceJSON as
        | Prisma.NullableJsonNullValueInput
        | Prisma.InputJsonValue
        | undefined,
    };
  }
}
