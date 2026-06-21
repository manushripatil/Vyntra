export default function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Vyntra</h1>

      <p>Credential-based Zero Knowledge Verification</p>

      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <a href="/issuer">Issuer</a>
        <a href="/wallet">Wallet</a>
        <a href="/verify">Verify</a>
      </div>
    </div>
  );
}