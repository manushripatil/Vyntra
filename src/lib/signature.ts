/**
 * Cross-platform SHA-256 hex hash for signing mock credentials.
 * Uses Web Crypto (`globalThis.crypto.subtle`) when available (browser and
 * Node.js WebCrypto), otherwise falls back to dynamic import of Node's
 * `crypto` module.
 */
export async function signCredential(data: any): Promise<string> {
  const payload = JSON.stringify(data);

  // Use Web Crypto API when available (browser or Node's globalThis.crypto)
  if (globalThis.crypto && (globalThis.crypto as any).subtle) {
    const enc = new TextEncoder();
    const hashed = await (globalThis.crypto as any).subtle.digest(
      "SHA-256",
      enc.encode(payload)
    );
    const hashArray = Array.from(new Uint8Array(hashed));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // Fallback: dynamic-import Node's crypto (keeps bundlers from including it)
  const { createHash } = await import("crypto");
  return createHash("sha256").update(payload).digest("hex");
}