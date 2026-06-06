export type AgeCredential = {
  credentialId: string;
  age: number;
  issuer: string;
  issuedAt: number;
};

// Optional helper (useful later for sanity checks)
export function createEmptyCredential(): AgeCredential {
  return {
    credentialId: "",
    age: 0,
    issuer: "",
    issuedAt: 0,
  };
}