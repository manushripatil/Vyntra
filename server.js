const express = require("express");
const snarkjs = require("snarkjs");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/verify-age", async (req, res) => {
  try {
    const { age } = req.body;

    console.log("INPUT RECEIVED:", age);

    const input = {
      age: Number(age)
    };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      "build/clean_js/clean.wasm",
      "circuit_final.zkey"
    );

    const vKey = JSON.parse(
      fs.readFileSync("verification_key.json")
    );

    const verified = await snarkjs.groth16.verify(
      vKey,
      publicSignals,
      proof
    );

    console.log("PUBLIC SIGNALS:", publicSignals);
    console.log("VERIFIED:", verified);

    res.json({
      success: true,
      allowed: verified && publicSignals[0] === "1"
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);

    res.json({
      success: false,
      allowed: false
    });
  }
});

app.listen(3000, () => {
  console.log("Vyntra API running on http://localhost:3000");
});