import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export type RewardType = "REPUTATION";

export class AchievementReward<T extends RewardType = RewardType> {
  public readonly type: T;
  public readonly amount: number;

  constructor({ type, amount }: NonFunctionProperties<AchievementReward>) {
    this.validateType(type);
    this.validateAmount(amount);
    this.type = type as T;
    this.amount = amount;
  }

  private validateType(type: string) {
    const allowedTypes: RewardType[] = ["REPUTATION"];
    if (!allowedTypes.includes(type as RewardType)) {
      throw new Error(`Invalid AchievementReward type: ${type}`);
    }
  }

  private validateAmount(value: number) {
    if (value < 0) {
      throw new Error(
        `AchievementCriterion value must be non-negative. Got: ${value}`
      );
    }
  }

  public static fromJSON(
    entry: Record<string, unknown> | string | null
  ): AchievementReward | null {
    if (!entry) return null;

    try {
      let parsed: AchievementReward;
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        parsed = typeof entry === "string" ? JSON.parse(entry) : entry;
      } catch (err) {
        console.warn("Failed to parse JSON:", err);
        throw new Error("Failed to parse JSON:");
      }

      const requiredAttributes = ["type", "amount"];
      let isValid = true;
      for (const [key] of Object.entries(parsed)) {
        if (!requiredAttributes.includes(key)) {
          isValid = false;
          break;
        }
      }
      if (isValid)
        throw new Error("Invalid reward: Missing required attributes");

      return new AchievementReward({
        type: parsed.type,
        amount: parsed.amount,
      });
    } catch (error: unknown) {
      console.error("failed to instance Achievement Reward from json", {
        error,
      });
      return null;
    }
  }
}
