document.getElementById("verifyBtn").addEventListener("click", verifyAge);

async function verifyAge() {
  const ageInput = document.getElementById("ageInput");
  const result = document.getElementById("result");

  const showProof = document.getElementById("toggleProof").checked;
  const showSignals = document.getElementById("toggleSignals").checked;
  const showExplain = document.getElementById("toggleExplain").checked;

  const age = ageInput.value;

  // safety check (because humans love breaking things)
  if (!age || isNaN(age) || age < 0) {
    result.innerText = "Enter a valid age";
    return;
  }

  result.innerText = "🧠 Generating zero-knowledge proof...";

  try {
    const res = await fetch("/prove-age", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ age: parseInt(age) })
    });

    const data = await res.json();

    if (!data.success) {
      result.innerText = "❌ Server error during proof generation";
      return;
    }

    const isAllowed = data.publicSignals[0] === "1";

    let output = "";

    output += isAllowed
      ? "✅ VERIFIED (age ≥ 16)\n"
      : "❌ NOT VERIFIED (age < 16)\n";

    output += "\n--- ZK RESULT ---\n";

    if (showSignals) {
      output += "\n📡 Public Signals:\n";
      output += JSON.stringify(data.publicSignals, null, 2) + "\n";
    }

    if (showProof) {
      output += "\n🔐 Groth16 Proof:\n";
      output += JSON.stringify(data.proof, null, 2) + "\n";
    }

    if (showExplain) {
      output += "\n🛡️ Privacy Guarantee:\n";
      output += "Your actual age is never transmitted.\nOnly a cryptographic proof is verified.\n";
    }

    result.innerText = output;

  } catch (err) {
    result.innerText = "Server unreachable: " + err.message;
  }
}
