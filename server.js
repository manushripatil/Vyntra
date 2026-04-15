const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const snarkjs = require("snarkjs");

const app = express();

app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Circuit paths
const wasmPath = path.join(__dirname, "clean_js", "clean.wasm");
const zkeyPath = path.join(__dirname, "circuit_final.zkey");

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    wasmExists: fs.existsSync(wasmPath),
    zkeyExists: fs.existsSync(zkeyPath)
  });
});

// 🔥 MAIN PROOF ENDPOINT (THIS MUST MATCH FRONTEND)
app.post("/prove-age", async (req, res) => {
  try {
    console.log("INPUT:", req.body);

    const age = parseInt(req.body.age);

    if (isNaN(age)) {
      return res.status(400).json({
        success: false,
        error: "Invalid age"
      });
    }

    if (!fs.existsSync(wasmPath) || !fs.existsSync(zkeyPath)) {
      return res.status(500).json({
        success: false,
        error: "Circuit files missing"
      });
    }

    const input = { age };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      wasmPath,
      zkeyPath
    );

    console.log("PUBLIC SIGNALS:", publicSignals);

    const isAllowed = publicSignals[0] === "1";

    return res.json({
      success: true,
      verified: isAllowed,
      publicSignals
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Vyntra running on port", PORT);
});
