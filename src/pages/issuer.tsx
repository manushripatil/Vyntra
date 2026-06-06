import { useState } from "react";
import { issueCredential } from "../lib/credentialService";
import { saveCredential } from "../lib/wallet";
import Link from "next/link";

export default function IssuerPage() {
  const [age, setAge] = useState<number>(18);
  const [status, setStatus] = useState("");
  const [isIssuing, setIsIssuing] = useState(false);

  const handleIssue = async () => {
    setIsIssuing(true);
    setStatus("");
    try {
      const credential = await issueCredential(age);
      saveCredential(credential);
      setStatus("Credential issued and saved ✔");
    } catch (err) {
      console.error(err);
      setStatus("Failed to issue credential");
    } finally {
      setIsIssuing(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Issuer</h1>

      <input
        type="number"
        value={age}
        onChange={(e) => setAge(Number(e.target.value))}
        style={{ padding: 8 }}
      />

      <button onClick={handleIssue} style={{ marginLeft: 10 }} disabled={isIssuing}>
        {isIssuing ? "Issuing…" : "Issue Credential"}
      </button>

      <p>{status}</p>

      <div style={{ marginTop: 20 }}>
        <Link href="/">Back</Link>
      </div>
    </div>
  );
}