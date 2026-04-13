const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const snarkjs = require("snarkjs");

const app = express();

app.use(cors());
app.use(express.json());

// --------------------
// Serve frontend
// --------------------
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// --------------------
// Circuit paths
// --------------------
const wasmPath = path.join(__dirname, "clean_js", "clean.wasm");
const zkeyPath = path.join(__dirname, "circuit_final.zkey");

// --------------------
// Health check (optional but useful)
// --------------------
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    wasmExists: fs.existsSync(wasmPath),
    zkeyExists: fs.existsSync(zkeyPath)
  });
});

// --------------------
// ZK Proof endpoint
// --------------------
app.post("/prove-age", async (req, res) => {
  try {
    console.log("INPUT RECEIVED:", req.body);

    const age = parseInt(req.body.age);

    // IMPORTANT: ONLY what circuit expects
    const input = {
      age: age
    };

    // Check files exist (prevents silent Render chaos)
    if (!fs.existsSync(wasmPath) || !fs.existsSync(zkeyPath)) {
      console.error("Circuit files missing");
      return res.status(500).json({
        success: false,
        error: "Circuit files missing (WASM or ZKEY)"
      });
    }

    // Generate proof
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      wasmPath,
      zkeyPath
    );

    console.log("PROOF GENERATED");

    return res.json({
      success: true,
      verified: true,
      proof,
      publicSignals
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// --------------------
// Start server
// --------------------
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Vyntra API running on port", PORT);
});
