import { useEffect, useState } from "react";
import Link from "next/link";
import { loadCredential } from "../lib/wallet";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:10000";

type ProofResponse = {
  success: boolean;
  verified?: boolean;
  proof?: any;
  publicSignals?: string[];
  error?: string;
};

type VerifyResponse = {
  success: boolean;
  verifiedProof?: boolean;
  error?: string;
};

export default function VerifyPage() {
  const [credential, setCredential] = useState<any>(null);
  const [age, setAge] = useState<number>(18);
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [proofResult, setProofResult] = useState<ProofResponse | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyResponse | null>(null);

  useEffect(() => {
    const stored = loadCredential();
    setCredential(stored);
    if (stored?.age) {
      setAge(stored.age);
    }
  }, []);

  const handleProve = async () => {
    setIsLoading(true);
    setStatus("");
    setProofResult(null);
    setVerifyResult(null);

    try {
      const response = await fetch(`${API_BASE}/prove-age`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ age })
      });

      const data: ProofResponse = await response.json();
      if (!response.ok || !data.success) {
        setStatus(data.error || "Proof generation failed");
        setIsLoading(false);
        return;
      }

      setProofResult(data);

      const verifyResponse = await fetch(`${API_BASE}/verify-proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proof: data.proof, publicSignals: data.publicSignals })
      });

      const verifyData: VerifyResponse = await verifyResponse.json();
      setVerifyResult(verifyData);
      if (!verifyResponse.ok || !verifyData.success) {
        setStatus(verifyData.error || "Proof verification failed");
      }
    } catch (error) {
      console.error(error);
      setStatus("Unable to contact proof server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Verify</h1>

      {credential ? (
        <div style={{ marginBottom: 20 }}>
          <p>
            Loaded wallet credential for age <strong>{credential.age}</strong>.
          </p>
          <p style={{ fontSize: 14, color: "#666" }}>
            This demo uses the credential age as the proof input.
          </p>
        </div>
      ) : (
        <p style={{ marginBottom: 20 }}>
          No wallet credential found. You can still generate a proof manually below.
        </p>
      )}

      <label style={{ display: "block", marginBottom: 10 }}>
        Age input:
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          style={{ marginLeft: 10, padding: 8, width: 80 }}
        />
      </label>

      <button onClick={handleProve} disabled={isLoading} style={{ padding: 10 }}>
        {isLoading ? "Generating proof…" : "Generate proof and verify"}
      </button>

      {status && (
        <p style={{ marginTop: 20, color: "crimson" }}>{status}</p>
      )}

      {proofResult && (
        <div style={{ marginTop: 20, padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
          <h2>Proof Result</h2>
          <p><strong>Public signal:</strong> {proofResult.publicSignals?.join(", ")}</p>
          <p><strong>Proof generation validity:</strong> {proofResult.verified ? "Yes" : "No"}</p>
          <p><strong>Proof verification result:</strong> {verifyResult?.verifiedProof ? "Valid" : "Invalid"}</p>
          <pre style={{ maxHeight: 240, overflow: "auto", background: "#f8f8f8", padding: 10 }}>
            {JSON.stringify({ proof: proofResult.proof, publicSignals: proofResult.publicSignals }, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <Link href="/">Back</Link>
      </div>
    </div>
  );
}
