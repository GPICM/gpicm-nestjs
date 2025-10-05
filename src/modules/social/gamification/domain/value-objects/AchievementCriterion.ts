export type AchievementOperator = ">=" | ">" | "<=" | "<" | "==" | "!=";

export type AchievementCriterionType =
  | "POSTS_COUNT"
  | "LIKES_RECEIVED"
  | "FOLLOWERS"
  | "DAYS_ACTIVE"
  | "SHARES"
  | "COMMENTS_COUNT";

export interface AchievementCriterionProps {
  type: AchievementCriterionType;
  operator: AchievementOperator;
  value: number;
  description?: string;
  metadata?: Record<string, unknown>;
  version?: string;
}

export class AchievementCriterion {
  public readonly type: AchievementCriterionType;
  public readonly operator: AchievementOperator;
  public readonly value: number;
  public readonly description?: string;
  public readonly metadata?: Record<string, unknown>;
  public readonly version: string;

  constructor({
    type,
    operator,
    value,
    description,
    version = "v1.0.0",
  }: AchievementCriterionProps) {
    this.validateType(type);
    this.validateOperator(operator);
    this.validateValue(value);
    this.validateVersion(version);

    this.type = type;
    this.operator = operator;
    this.value = value;
    this.description = description;
    this.metadata = {};
    this.version = version;
  }

  // ------------------------------
  // Validation methods
  // ------------------------------

  private validateType(type: string) {
    const allowedTypes: AchievementCriterionType[] = [
      "POSTS_COUNT",
      "LIKES_RECEIVED",
      "FOLLOWERS",
      "DAYS_ACTIVE",
      "SHARES",
      "COMMENTS_COUNT",
    ];
    if (!allowedTypes.includes(type as AchievementCriterionType)) {
      throw new Error(`Invalid AchievementCriterion type: ${type}`);
    }
  }

  private validateOperator(operator: string) {
    const allowedOperators: AchievementOperator[] = [
      ">=",
      ">",
      "<=",
      "<",
      "==",
      "!=",
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

  private validateVersion(version: string) {
    if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
      throw new Error(
        `Version must be a semantic version string (e.g., 1.0.0). Got: ${version}`
      );
    }
  }

  // ------------------------------
  // Utility methods
  // ------------------------------

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
      case ">=":
        return value >= this.value;
      case ">":
        return value > this.value;
      case "<=":
        return value <= this.value;
      case "<":
        return value < this.value;
      case "==":
        return value === this.value;
      case "!=":
        return value !== this.value;
      default:
        return false;
    }
  }
}
