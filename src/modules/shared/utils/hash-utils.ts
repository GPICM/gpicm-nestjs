import crypto from "crypto";

export function computeContentHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

export function isHashEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, "hex");
  const bufferB = Buffer.from(b, "hex");

  // Hashes must be the same length for timingSafeEqual to work
  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferA, bufferB);
}
