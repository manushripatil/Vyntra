async function verifyAge() {
  console.log("BUTTON CLICKED");

  const ageInput = document.getElementById("ageInput");
  const result = document.getElementById("result");

  const age = ageInput.value;

  console.log("AGE:", age);

  if (!age || isNaN(age) || age < 0) {
    result.innerText = "Enter valid age";
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

    if (!data.success) {
      result.innerText = "Server error";
      return;
    }

    const isAllowed = data.publicSignals[0] === "1";

    result.innerText = isAllowed
      ? "✅ Allowed (16+)"
      : "❌ Not allowed";

  } catch (err) {
    console.error(err);
    result.innerText = "Server not reachable";
  }
}
