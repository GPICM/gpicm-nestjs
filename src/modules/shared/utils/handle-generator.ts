import { slugify } from "transliteration";

/**
 * Generates a base handle from displayName.
 */
export function generateBaseHandle(displayName: string): string {
  const base = slugify(displayName, { lowercase: true, separator: "" });
  return base.replace(/[^a-z0-9_]/g, "").slice(0, 20) || "user";
}

/**
 * Creates variations: base, base1, base2 ... base123
 */
export function generateHandleCandidates(base: string, count = 5): string[] {
  const candidates = [base];
  for (let i = 1; i <= count; i++) {
    candidates.push(`${base}${i}`);
  }
  return candidates;
}
