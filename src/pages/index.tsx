import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Vyntra</h1>

      <p>Credential-based Zero Knowledge Verification</p>

      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <Link href="/issuer">Issuer</Link>
        <Link href="/wallet">Wallet</Link>
        <Link href="/verify">Verify</Link>
      </div>
    </div>
  );
}