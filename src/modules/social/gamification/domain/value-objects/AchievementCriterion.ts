export enum AchievementOperator {
  Gte = ">=",
  Gt = ">",
  Lte = "<=",
  Lt = "<",
  Eq = "==",
  Ne = "!=",
}

export enum AchievementCriterionType {
  FOLLOWERS = "FOLLOWERS",
  POSTS_COUNT = "POSTS_COUNT",
  COMMENTS_COUNT = "COMMENTS_COUNT",
}

export interface AchievementCriterionProps {
  type: AchievementCriterionType;
  operator: AchievementOperator;
  value: number;
  description?: string;
  version?: string;
}

export class AchievementCriterion {
  public readonly type: AchievementCriterionType;
  public readonly operator: AchievementOperator;
  public readonly value: number;
  public readonly description: string;
  public readonly metadata: Record<string, unknown> | null;
  public readonly version: string;

  constructor({
    type,
    operator,
    value,
    description,
    version = "v1",
  }: AchievementCriterionProps) {
    this.validateType(type);
    this.validateOperator(operator);
    this.validateValue(value);

    this.type = type;
    this.operator = operator;
    this.value = value;
    this.description = description || "";
    this.metadata = {};
    this.version = version;
  }

  private validateType(type: string) {
    if (
      !Object.values(AchievementCriterionType).includes(
        type as AchievementCriterionType
      )
    ) {
      throw new Error(`Invalid AchievementCriterion type: ${type}`);
    }
  }

  private validateOperator(operator: string) {
    const allowedOperators: AchievementOperator[] = [
      AchievementOperator.Gte,
      AchievementOperator.Gt,
      AchievementOperator.Lte,
      AchievementOperator.Lt,
      AchievementOperator.Eq,
      AchievementOperator.Ne,
    ];
    if (!allowedOperators.includes(operator as AchievementOperator)) {
      throw new Error(`Invalid AchievementCriterion operator: ${operator}`);
    }
  }

  private validateValue(value: number) {
    if (value < 0) {
      throw new Error(
        `AchievementCriterion value must be non-negative. Got: ${value}`
      );
    }
  }

  public toJSON() {
    return {
      type: this.type,
      operator: this.operator,
      value: this.value,
      description: this.description,
      metadata: this.metadata,
      version: this.version,
    };
  }

  public matches(value: number): boolean {
    switch (this.operator) {
      case AchievementOperator.Gte:
        return value >= this.value;
      case AchievementOperator.Gt:
        return value > this.value;
      case AchievementOperator.Lte:
        return value <= this.value;
      case AchievementOperator.Lt:
        return value < this.value;
      case AchievementOperator.Eq:
        return value === this.value;
      case AchievementOperator.Ne:
        return value !== this.value;
      default:
        return false;
    }
  }

  public static fromJSON(
    entry: Record<string, unknown> | string | null
  ): AchievementCriterion | null {
    if (!entry) return null;

    try {
      let parsed: AchievementCriterion;
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        parsed = typeof entry === "string" ? JSON.parse(entry) : entry;
      } catch (err) {
        console.warn("Failed to parse JSON:", err);
        throw new Error("Failed to parse JSON");
      }

      const requiredAttributes = ["type", "operator", "value", "description"];
      let isValid = true;
      for (const [key] of Object.entries(parsed)) {
        if (!requiredAttributes.includes(key)) {
          isValid = false;
          break;
        }
      }
      if (isValid)
        throw new Error("Invalid criteria: Missing required attributes");

      return new AchievementCriterion({
        type: parsed.type,
        operator: parsed.operator,
        value: parsed.value,
        description: parsed.description,
      });
    } catch (error: unknown) {
      console.error("failed to instance Achievement Creterion from json", {
        error,
      });
      return null;
    }
  }
}
