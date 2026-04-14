async function verifyAge() {
  const ageInput = document.getElementById("age");
  const result = document.getElementById("result");

  const age = ageInput.value;

  console.log("BUTTON CLICKED");
  console.log("AGE:", age);

  // Basic validation so your API isn’t fed nonsense
  if (!age || isNaN(age)) {
    result.innerText = "Enter a valid age";
    return;
  }

  result.innerText = "Verifying...";

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

    if (!data.success) {
      result.innerText = "Server error: " + data.error;
      return;
    }

    // THIS is the only thing that matters
    if (data.verified) {
      result.innerText = "✅ Allowed (16+)";
    } else {
      result.innerText = "❌ Not allowed";
    }

  } catch (err) {
    console.error("FETCH ERROR:", err);
    result.innerText = "Server not reachable";
  }
}
