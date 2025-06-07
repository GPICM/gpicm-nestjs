import { Prisma } from "@prisma/client";
import { PostVote, VoteValue } from "../../domain/entities/PostVote";
import { UserShallow } from "../../domain/entities/UserShallow";

export const postVoteInclude = Prisma.validator<Prisma.PostVoteInclude>()({
  User: true,
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
      User: {
        connect: { id: vote.user.id },
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

    const userData = prismaData.User;

    return new PostVote({
      postId: prismaData.postId,
      value: prismaData.value as VoteValue,
      user: new UserShallow({
        id: userData.id,
        name: userData.name ?? "",
        profilePicture: userData.profilePicture ?? "",
        publicId: userData.publicId,
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
