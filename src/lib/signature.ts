import crypto from "crypto";

/**
 * Mock credential signing function.
 * 
 * In production ZK systems, this would be replaced with:
 * - real issuer signature (EdDSA / BLS / etc.)
 * - or circuit-compatible commitment scheme
 * 
 * For now: deterministic SHA-256 hash so everything is stable.
 */
export function signCredential(data: any): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex");
}