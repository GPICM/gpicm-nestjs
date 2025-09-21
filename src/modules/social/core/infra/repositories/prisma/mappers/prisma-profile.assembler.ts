import { Prisma } from "@prisma/client";
import { Profile } from "@/modules/social/core/domain/entities/Profile";

export const profileInclude = Prisma.validator<Prisma.ProfileInclude>()({
  User: false, // set as true when needed
});

type ProfileJoinModel = Prisma.ProfileGetPayload<{
  include: typeof profileInclude;
}>;

export class ProfileAssembler {
  public static fromPrisma(
    prismaData?: ProfileJoinModel | null
  ): Profile | null {
    if (!prismaData) return null;

    return new Profile({
      id: prismaData.id,
      bio: prismaData.bio || "",
      displayName: prismaData.displayName,
      followersCount: prismaData.followingCount,
      followingCount: prismaData.followersCount,
      handle: prismaData.handle,
      profileImage: prismaData.profileImage,
      postsCount: prismaData.postsCount ?? 0,
      commentsCount: prismaData.commentsCount ?? 0,
      userId: prismaData.userId,
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
      profileImage: profile.profileImage,
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
      profileImage: profile.profileImage,
    };
  }
}
