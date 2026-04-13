async function verifyAge() {
  console.log("BUTTON CLICKED");

  const age = document.getElementById("ageInput").value;
  console.log("AGE:", age);

  const res = await fetch("/prove-age", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      age: age
    })
  });

  const data = await res.json();
  console.log("SERVER RESPONSE:", data);

  document.getElementById("result").innerText =
    data.verified ? "✅ Verified" : "❌ Not Verified";
}
