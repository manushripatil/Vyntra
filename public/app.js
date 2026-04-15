async function verifyAge() {
  const age = document.getElementById("age").value;
  const result = document.getElementById("result");

  const showProof = document.getElementById("toggleProof").checked;
  const showSignals = document.getElementById("toggleSignals").checked;
  const showExplain = document.getElementById("toggleExplain").checked;

  result.innerText = "🧠 Generating zero-knowledge proof...";

  if (!age || isNaN(age) || age < 0) {
    result.innerText = "Enter a valid age";
    return;
  }

  try {
    const res = await fetch("/prove-age", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ age: parseInt(age) })
    });

    const data = await res.json();

    if (!data.success) {
      result.innerText = "❌ Proof generation failed";
      return;
    }

    const isAllowed = data.publicSignals[0] === "1";

    let output = "";

    output += isAllowed
      ? "✅ VERIFIED: Age ≥ 16\n"
      : "❌ NOT VERIFIED: Age < 16\n";

    output += "\n--- RESULTS ---\n";

    if (showSignals) {
      output += "\n📡 Public Signals:\n";
      output += JSON.stringify(data.publicSignals, null, 2) + "\n";
    }

    if (showProof) {
      output += "\n🔐 ZK Proof (Groth16):\n";
      output += JSON.stringify(data.proof, null, 2) + "\n";
    }

    if (showExplain) {
      output += "\n🛡️ Privacy Layer:\n";
      output += "Your actual age is never transmitted.\nOnly a cryptographic proof is verified on the server.\n";
    }

    result.innerText = output;

  } catch (err) {
    result.innerText = "Server error: " + err.message;
  }
}
