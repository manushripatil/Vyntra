const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const snarkjs = require("snarkjs");

const app = express();
app.use(cors());
app.use(express.json());

// ==============================
// PATHS
// ==============================
const wasmPath = path.join(__dirname, "clean_js", "clean.wasm");
const zkeyPath = path.join(__dirname, "circuit_final.zkey");

// input.json temp file (snarkjs needs this style)
const inputPath = path.join(__dirname, "input.json");

// ==============================
// DEBUG
// ==============================
console.log("ZK SERVER BOOTED");
console.log("WASM:", fs.existsSync(wasmPath));
console.log("ZKEY:", fs.existsSync(zkeyPath));

// ==============================
// ROUTE
// ==============================
app.post("/prove-age", async (req, res) => {
  try {
    const { age } = req.body;

    console.log("INPUT:", req.body);

    // --------------------------
    // CREATE INPUT FOR CIRCUIT
    // --------------------------
    const input = {
      age: parseInt(age),
      threshold: 16
    };

    fs.writeFileSync(inputPath, JSON.stringify(input));

    // --------------------------
    // CHECK FILES
    // --------------------------
    if (!fs.existsSync(wasmPath) || !fs.existsSync(zkeyPath)) {
      return res.status(500).json({
        success: false,
        error: "Circuit files missing"
      });
    }

    // --------------------------
    // REAL ZK PROOF GENERATION
    // --------------------------
    const { proof, publicSignals } =
      await snarkjs.groth16.fullProve(
        input,
        wasmPath,
        zkeyPath
      );

    // --------------------------
    // RESPONSE
    // --------------------------
    return res.json({
      success: true,
      verified: true,
      proof,
      publicSignals
    });

  } catch (err) {
    console.error("ZK ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ==============================
// START SERVER
// ==============================
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Vyntra ZK API running on", PORT);
});
