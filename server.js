const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const snarkjs = require("snarkjs");

const app = express();
app.use(cors());
app.use(express.json());

// =====================
// STATIC FRONTEND
// =====================
app.use(express.static(path.join(__dirname, "public")));

// =====================
// ROUTES
// =====================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// =====================
// ZK PATHS
// =====================
const wasmPath = path.join(__dirname, "clean_js", "clean.wasm");
const zkeyPath = path.join(__dirname, "circuit_final.zkey");

// =====================
// API
// =====================
app.post("/prove-age", async (req, res) => {
  try {
    const { age } = req.body;

    console.log("INPUT RECEIVED:", req.body);

    if (!fs.existsSync(wasmPath) || !fs.existsSync(zkeyPath)) {
      console.error("Missing circuit files");
      return res.status(500).json({
        success: false,
        error: "Circuit files missing (WASM or ZKEY)"
      });
    }

    const input = {
      age: parseInt(age),
      threshold: 16
    };

    const { proof, publicSignals } =
      await snarkjs.groth16.fullProve(
        input,
        wasmPath,
        zkeyPath
      );

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

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Vyntra API running on port", PORT);
});
