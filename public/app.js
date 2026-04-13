async function verifyAge() {
  const ageInput = document.getElementById("ageInput");
  const result = document.getElementById("result");

  console.log("BUTTON CLICKED");

  const age = ageInput.value;
  console.log("AGE:", age);

  try {
    const res = await fetch("/prove-age", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ age })
    });

    const data = await res.json();
    console.log("SERVER RESPONSE:", data);

    if (data.success && data.verified) {
      result.innerText = "✅ Verified";
    } else {
      result.innerText = "❌ Not Verified";
    }

  } catch (err) {
    console.error(err);
    result.innerText = "Server error";
  }
}
