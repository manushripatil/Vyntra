async function verifyAge() {
  const ageInput = document.getElementById("ageInput");
  const verifyBtn = document.getElementById("verifyBtn");

  console.log("BUTTON CLICKED");

  if (!ageInput || !verifyBtn) {
    console.error("Missing HTML elements (verifyBtn or ageInput)");
    return;
  }

  const age = ageInput.value;
  console.log("AGE:", age);

  try {
    const res = await fetch("https://vyntra-4rae.onrender.com/prove-age", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ age })
    });

    const data = await res.json();
    console.log("SERVER RESPONSE:", data);

    const result = document.getElementById("result");

    if (data.success && data.verified) {
      result.innerText = "✅ Verified";
    } else {
      result.innerText = "❌ Not Verified";
    }

  } catch (err) {
    console.error("FETCH ERROR:", err);
  }
}
