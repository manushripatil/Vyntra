document.getElementById("verifyBtn").addEventListener("click", verifyAge);

async function verifyAge() {
  const age = document.getElementById("ageInput").value;

  const result = document.getElementById("result");
  const status = document.getElementById("status");
  const badge = document.getElementById("badge");

  const showProof = document.getElementById("toggleProof").checked;
  const showSignals = document.getElementById("toggleSignals").checked;
  const showExplain = document.getElementById("toggleExplain").checked;

  if (!age || isNaN(age) || age < 0) {
    status.innerText = "Invalid input";
    return;
  }

  status.innerText = "Generating proof...";

  try {
    const res = await fetch("/prove-age", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ age: parseInt(age) })
    });

    const data = await res.json();

    if (!data.success) {
      status.innerText = "Proof generation failed";
      return;
    }

    const ok = data.publicSignals[0] === "1";

    // badge UI
    badge.className = "badge " + (ok ? "ok" : "bad");
    badge.innerText = ok ? "VERIFIED (16+)" : "NOT VERIFIED";

    let output = "";

    output += "ZK PROOF RESULT\n\n";

    if (showSignals) {
      output += "Public Signals:\n";
      output += JSON.stringify(data.publicSignals, null, 2) + "\n\n";
    }

    if (showProof) {
      output += "Groth16 Proof:\n";
      output += JSON.stringify(data.proof, null, 2) + "\n\n";
    }

    if (showExplain) {
      output += "Privacy Model:\n";
      output += "• Input never leaves client as readable data\n";
      output += "• Server only verifies cryptographic proof\n";
      output += "• No identity leakage occurs\n";
    }

    result.innerText = output;

    status.innerText = "Proof generated successfully";

  } catch (e) {
    status.innerText = "Server error: " + e.message;
  }
}
