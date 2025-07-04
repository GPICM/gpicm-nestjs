import { Injectable } from "@nestjs/common";
import { Policy } from "../entities/Policy";

@Injectable()
export abstract class PoliciesRepository {
  abstract findById(id: string): Promise<Policy>;

  abstract findLatestPolicies(): Promise<Policy[]>;
}
