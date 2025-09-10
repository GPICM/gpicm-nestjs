import { Profile } from "@/modules/feed/domain/entities/Profile";

export abstract class ProfileRepository {
  abstract findById(id: number): Promise<Profile | null>;
  abstract findByUserId(userId: number): Promise<Profile | null>;
  abstract create(profile: Profile): Promise<Profile>;
  abstract update(profile: Profile): Promise<Profile>;
  abstract delete(id: number): Promise<void>;
  abstract refreshPostCount(userId: number): Promise<void>;
  abstract refreshCommentCount(userId: number): Promise<void>;
}

export abstract class ProfileFollowRepository {
  abstract follow(followerId: number, followingId: number): Promise<void>;
  abstract unfollow(followerId: number, followingId: number): Promise<void>;
  abstract isFollowing(
    followerId: number,
    followingId: number
  ): Promise<boolean>;
  abstract getFollowersCount(profileId: number): Promise<number>;
  abstract getFollowingCount(profileId: number): Promise<number>;
  abstract countFollowersByProfileId(profileId: number): Promise<number>;
  abstract countFollowingByProfileId(profileId: number): Promise<number>;
  abstract getFollowers(
    profileId: number,
    limit?: number,
    offset?: number
  ): Promise<Profile[]>;
  abstract getFollowing(
    profileId: number,
    limit?: number,
    offset?: number
  ): Promise<Profile[]>;
}
