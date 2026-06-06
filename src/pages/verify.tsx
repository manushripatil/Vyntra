import Link from "next/link";

export default function VerifyPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Verify</h1>

      <p>Groth16 proof verification runs here.</p>

      <p>Next step: connect wallet credential → circuit input</p>

      <div style={{ marginTop: 20 }}>
        <Link href="/">Back</Link>
      </div>
    </div>
  );
}