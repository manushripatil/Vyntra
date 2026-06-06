import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
<<<<<<< HEAD
import snarkjs from "snarkjs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
=======
import * as snarkjs from "snarkjs";
import { fileURLToPath } from "url";
>>>>>>> 8bf6059 (fix snarkjs esm compatibility + stabilize proof endpoint)

// --------------------
// ESM __dirname fix
// --------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------
// App setup
// --------------------
const app = express();

app.use(cors());
app.use(express.json());
<<<<<<< HEAD
app.use(express.static(path.join(__dirname, "public")));

const wasmPath = path.join(__dirname, "clean_js", "clean.wasm");
const zkeyPath = path.join(__dirname, "circuit_final.zkey");

=======

// Optional static frontend (only if you actually use /public)
app.use(express.static(path.join(__dirname, "public")));

// --------------------
// Circuit paths
// --------------------
const wasmPath = path.join(__dirname, "clean_js", "clean.wasm");
const zkeyPath = path.join(__dirname, "circuit_final.zkey");

// --------------------
// Health check (debug endpoint)
// --------------------
>>>>>>> 8bf6059 (fix snarkjs esm compatibility + stabilize proof endpoint)
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    wasmExists: fs.existsSync(wasmPath),
    zkeyExists: fs.existsSync(zkeyPath)
  });
});

<<<<<<< HEAD
app.post("/prove-age", async (req, res) => {
  try {
    const age = parseInt(req.body.age);

    if (isNaN(age)) {
      return res.status(400).json({ success: false, error: "Invalid age" });
    }

=======
// --------------------
// MAIN ZK PROOF ENDPOINT
// --------------------
app.post("/prove-age", async (req, res) => {
  try {
    console.log("INPUT:", req.body);

    const age = Number(req.body.age);

    if (!age || Number.isNaN(age)) {
      return res.status(400).json({
        success: false,
        error: "Invalid age"
      });
    }

    // Circuit input
>>>>>>> 8bf6059 (fix snarkjs esm compatibility + stabilize proof endpoint)
    const input = { age };

    // Generate proof
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      wasmPath,
      zkeyPath
    );

<<<<<<< HEAD
    const isAllowed = publicSignals[0] === "1";
=======
    console.log("PUBLIC SIGNALS:", publicSignals);

    const verified = publicSignals?.[0] === "1";
>>>>>>> 8bf6059 (fix snarkjs esm compatibility + stabilize proof endpoint)

    res.json({
      success: true,
      verified,
      proof,
      publicSignals
    });

  } catch (err) {
<<<<<<< HEAD
    res.status(500).json({
=======
    console.error("PROOF ERROR:", err);

    return res.status(500).json({
>>>>>>> 8bf6059 (fix snarkjs esm compatibility + stabilize proof endpoint)
      success: false,
      error: err.message || "Unknown error"
    });
  }
});

<<<<<<< HEAD
=======
// --------------------
// Start server (Render-safe)
// --------------------
>>>>>>> 8bf6059 (fix snarkjs esm compatibility + stabilize proof endpoint)
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Vyntra running on port ${PORT}`);
});