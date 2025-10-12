import { Prisma } from "@prisma/client";
import { PostVote, VoteValue } from "../../domain/entities/PostVote";
import { ProfileSummary } from "../../domain/object-values/ProfileSummary";

export const postVoteInclude = Prisma.validator<Prisma.PostVoteInclude>()({
  Profile: {
    select: {
      id: true,
      handle: true,
      displayName: true,
      avatarUrl: true,
    },
  },
});

type PostVoteJoinModel = Prisma.PostVoteGetPayload<{
  include: typeof postVoteInclude;
}>;

class PostVoteAssembler {
  public static toPrismaCreate(vote: PostVote): Prisma.PostVoteCreateInput {
    return {
      Post: {
        connect: { id: vote.postId },
      },
      Profile: {
        connect: { id: vote.profile.id },
      },
      value: vote.value,
    };
  }

  public static toPrismaUpdate(vote: PostVote): Prisma.PostVoteUpdateInput {
    return {
      value: vote.value,
    };
  }

  public static fromPrisma(
    prismaData: PostVoteJoinModel | null
  ): PostVote | null {
    if (!prismaData) return null;

    const profileData = prismaData.Profile;

    return new PostVote({
      postId: prismaData.postId,
      value: prismaData.value as VoteValue,
      profile: new ProfileSummary({
        id: profileData.id,
        name: profileData.displayName ?? "",
        avatarUrl: profileData.avatarUrl || "",
        handle: profileData.handle,
      }),
    });
  }

  public static fromPrismaMany(
    prismaDataArray: PostVoteJoinModel[]
  ): PostVote[] {
    const votes: PostVote[] = [];

    for (const prismaData of prismaDataArray) {
      const post = this.fromPrisma(prismaData);
      if (post) {
        votes.push(post);
      }
    }
    return votes;
  }
}

export { PostVoteAssembler };
