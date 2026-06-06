import { AgeCredential } from "../types/credential";

const KEY = "vyntra_wallet";

export function saveCredential(cred: AgeCredential) {
  if (typeof window === "undefined") return;

  localStorage.setItem(KEY, JSON.stringify(cred));
}

export function loadCredential(): AgeCredential | null {
  if (typeof window === "undefined") return null;

  const data = localStorage.getItem(KEY);
  if (!data) return null;

  return JSON.parse(data);
}

export function clearCredential() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(KEY);
}