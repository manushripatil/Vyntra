import { useEffect, useState } from "react";
import { loadCredential, clearCredential } from "../lib/wallet";
import Link from "next/link";

export default function WalletPage() {
  const [credential, setCredential] = useState<any>(null);

  useEffect(() => {
    setCredential(loadCredential());
  }, []);

  const handleClear = () => {
    clearCredential();
    setCredential(null);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Wallet</h1>

      {!credential && <p>No credential found</p>}

      {credential && (
        <div>
          <p><b>Issuer:</b> {credential.issuer}</p>
          <p><b>Age:</b> {credential.age}</p>
          <p><b>ID:</b> {credential.credentialId}</p>
          <p><b>Issued:</b> {credential.issuedAt}</p>

          <button onClick={handleClear}>
            Clear Wallet
          </button>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <Link href="/">Back</Link>
      </div>
    </div>
  );
}