async function verifyAge() {
  const age = document.getElementById("age").value;
  const result = document.getElementById("result");

  console.log("BUTTON CLICKED");
  console.log("AGE:", age);

  result.innerText = "Verifying...";

  try {
    console.log("Sending request...");

    const res = await fetch("/prove-age"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ age })
    });

    const data = await res.json();

    console.log("SERVER RESPONSE:", JSON.stringify(data, null, 2));

    if (!data.success) {
      result.innerText = "Server error";
      return;
    }

    result.innerText = data.allowed
      ? "✅ Allowed (16+)"
      : "❌ Not allowed";

  } catch (err) {
    console.error(err);
    result.innerText = "Server not reachable";
  }
}
