async function verifyAge() {
  const ageInput = document.getElementById("ageInput");
  const result = document.getElementById("result");

  const steps = document.getElementById("toggleSteps");
  const flow = document.getElementById("toggleDataFlow");

  const age = ageInput.value;

  if (!age || isNaN(age) || age < 0) {
    result.innerText = "Enter valid age";
    return;
  }

  result.innerText = "Initializing proof...";

  if (steps.checked) {
    await delay(400);
    result.innerText = "Executing circuit...";
    await delay(600);
    result.innerText = "Generating witness...";
    await delay(600);
  }

  try {
    const res = await fetch("/prove-age", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ age: parseInt(age) })
    });

    const data = await res.json();

    if (!data.success) {
      result.innerText = "Verification failed";
      return;
    }

    const ok = data.publicSignals[0] === "1";

    let out = ok ? "✅ Verified (16+)" : "❌ Not verified";

    if (flow.checked) {
      out += "\n\nData Flow:\n- Age: not transmitted\n- Proof: transmitted\n- Identity: never exposed";
    }

    result.innerText = out;

  } catch (e) {
    result.innerText = "Server unreachable";
  }
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}
