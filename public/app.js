async function verifyAge() {
  console.log("BUTTON CLICKED");

  const ageInput = document.getElementById("ageInput");
  const result = document.getElementById("result");

  const age = ageInput.value;
  console.log("AGE:", age);

  // Basic validation (so someone doesn’t enter -42 and break reality)
  if (!age || isNaN(age) || age < 0) {
    result.innerText = "Enter a valid age";
    return;
  }

  result.innerText = "Generating proof...";

  try {
    const res = await fetch("/prove-age", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ age: parseInt(age) })
    });

    const data = await res.json();
    console.log("SERVER RESPONSE:", data);

    // Handle backend failure
    if (!data.success) {
      result.innerText = "Server error";
      return;
    }

    // ✅ THIS is the real logic (not data.verified)
    const isAllowed = data.publicSignals[0] === "1";

    result.innerText = isAllowed
      ? "✅ Allowed (16+)"
      : "❌ Not allowed";

  } catch (err) {
    console.error("FETCH ERROR:", err);
    result.innerText = "Server not reachable";
  }
}
