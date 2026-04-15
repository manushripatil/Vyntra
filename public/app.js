async function verifyAge() {
  const ageInput = document.getElementById("ageInput");
  const result = document.getElementById("result");

  const dataFlow = document.getElementById("toggleDataFlow");
  const steps = document.getElementById("toggleSteps");

  const age = ageInput.value;

  if (!age || isNaN(age) || age < 0) {
    result.innerText = "Enter valid age";
    return;
  }

  result.innerText = "Generating proof...";

  // STEP VISUALIZATION
  if (steps.checked) {
    result.innerText = "Step 1: Reading input...";
    await delay(500);

    result.innerText = "Step 2: Running ZK circuit...";
    await delay(700);

    result.innerText = "Step 3: Generating proof...";
    await delay(700);
  }

  try {
    const res = await fetch("/prove-age", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ age: parseInt(age) })
    });

    const data = await res.json();

    if (!data.success) {
      result.innerText = "Server error";
      return;
    }

    const isAllowed = data.publicSignals[0] === "1";

    let output = isAllowed
      ? "✅ Allowed (16+)"
      : "❌ Not allowed";

    // DATA FLOW TOGGLE
    if (dataFlow.checked) {
      output += "\n\nData Flow:\n";
      output += "- Age: NOT sent\n";
      output += "- Proof: sent\n";
      output += "- Identity: hidden";
    }

    result.innerText = output;

  } catch (err) {
    result.innerText = "Server not reachable";
  }
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}
