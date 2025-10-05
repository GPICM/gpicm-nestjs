export type RewardType = "REPUTATION";

export interface AchievementReward<T extends RewardType = RewardType> {
  type: T;
  amount: number;
  description?: string;
}
