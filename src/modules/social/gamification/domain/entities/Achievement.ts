import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { AchievementCriterion } from "../value-objects/AchievementCriterion";
import { AchievementReward } from "../value-objects/AchievementReward";
import { MediaSource } from "@/modules/assets/domain/object-values/media-source";

export const NEW_ENTITY_ID = -1;
export class Achievement {
  public id: number;

  public readonly name: string;

  public readonly description: string;

  public readonly criteria: AchievementCriterion[];

  public readonly rewards: AchievementReward[];

  public readonly imageSources: MediaSource | null;

  public readonly imageThumbnailUrl: string | null;

  public readonly imageBlurHash: string | null;

  constructor(args: NonFunctionProperties<Achievement>) {
    Object.assign(this, args);

    this.validate();
  }

  public setId(newId: number) {
    if (this.id !== NEW_ENTITY_ID) {
      throw new Error("Cannot set id from a existing Entity");
    }

    this.id = newId;
  }

  private validate(): void {
    const hasCriteria =
      Array.isArray(this.criteria) && this.criteria.length > 0;
    const hasRewards = Array.isArray(this.rewards) && this.rewards.length > 0;

    if (!hasCriteria || !hasRewards) {
      throw new Error(
        `Invalid Achievement: must have at least one criterion and one reward.`
      );
    }

    if (!this.name?.trim()) {
      throw new Error("Invalid Achievement: name is required.");
    }

    if (!this.description?.trim()) {
      throw new Error("Invalid Achievement: description is required.");
    }
  }
}
