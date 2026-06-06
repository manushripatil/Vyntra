import { AgeCredential } from "../types/credential";
import { signCredential } from "./signature";

export function issueCredential(age: number): AgeCredential {
  return {
    credentialId: crypto.randomUUID(),
    issuer: "DemoGov",
    age,
    issuedAt: new Date().toISOString(),
    signature: signCredential(age),
  };
}