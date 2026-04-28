import { randomBytes, createHash } from "crypto";

const API_KEY_PREFIX = "tk_";
const API_KEY_RANDOM_BYTES = 24; // 24 bytes = 48 hex chars

/**
 * Generate a new API key with the `tk_` prefix.
 * Returns the full plaintext key (shown to the user once).
 */
export function generateApiKey(): string {
  const random = randomBytes(API_KEY_RANDOM_BYTES).toString("hex");
  return `${API_KEY_PREFIX}${random}`;
}

/**
 * Hash an API key using SHA-256 for secure storage.
 * Only the hash is stored in the database — the plaintext is never persisted.
 */
export function hashApiKey(plaintext: string): string {
  return createHash("sha256").update(plaintext).digest("hex");
}

/**
 * Extract a display-safe prefix from a plaintext API key.
 * Example: "tk_a1b2c3d4..." → "tk_a1b2..."
 */
export function getKeyPrefix(plaintext: string): string {
  return plaintext.slice(0, 8) + "...";
}
