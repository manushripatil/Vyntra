import { AgeCredential } from "../types/credential";
import { signCredential } from "./signature";

export function issueCredential(age: number): AgeCredential {
  const credentialId = crypto.randomUUID();

  return {
    credentialId,
    issuer: "DemoGov",
    age,
    issuedAt: Date.now(),
    signature: signCredential({ credentialId, age, issuedAt: Date.now() }),
  };
}