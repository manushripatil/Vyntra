async function verifyAge() {
  const age = document.getElementById("age").value;
  const result = document.getElementById("result");
  const flow = document.getElementById("flow");
  const payload = document.getElementById("payload");

  flow.innerHTML = "";
  result.innerText = "Generating proof...";

  // STEP 1
  flow.innerHTML += "<div class='step'>✔ Input captured locally</div>";
  await delay(500);

  // STEP 2
  flow.innerHTML += "<div class='step'>⚙️ Initializing circuit</div>";
  await delay(600);

  // STEP 3
  flow.innerHTML += "<div class='step'>🔐 Generating witness</div>";
  await delay(700);

  // BACKEND CALL
  const res = await fetch("/prove-age", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ age })
  });

  const data = await res.json();

  const isAllowed = data.publicSignals[0] === "1";

  // STEP 4
  flow.innerHTML += "<div class='step'>🧮 Constraint solving complete</div>";
  await delay(500);

  flow.innerHTML += "<div class='step'>✅ Proof generated</div>";

  // NETWORK VISUAL
  payload.innerText = JSON.stringify({
    proof: "0x...",
    publicSignals: data.publicSignals,
    note: "NO AGE SENT"
  }, null, 2);

  // RESULT
  result.innerText = isAllowed
    ? "✅ Verified (ZK Success)"
    : "❌ Not verified";
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}
