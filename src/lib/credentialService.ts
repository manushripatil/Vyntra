import { AgeCredential } from "../types/credential";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export async function issueCredential(
  age: number
): Promise<AgeCredential> {
  const res = await fetch(`${API_BASE}/issue`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.NEXT_PUBLIC_ISSUER_TOKEN
        ? {
            "x-issuer-token":
              process.env.NEXT_PUBLIC_ISSUER_TOKEN,
          }
        : {}),
    },
    body: JSON.stringify({ age }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Issue failed: ${res.status} ${text}`);
  }

  const data = await res.json();

  if (!data.success || !data.credential) {
    throw new Error("Invalid response from issuer");
  }

  return data.credential as AgeCredential;
}