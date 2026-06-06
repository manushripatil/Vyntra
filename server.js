import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import * as snarkjs from "snarkjs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------
// App setup
// --------------------
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --------------------
// Circuit paths
// --------------------
const wasmPath = path.join(__dirname, "clean_js", "clean.wasm");
const zkeyPath = path.join(__dirname, "circuit_final.zkey");
const verificationKeyPath = path.join(__dirname, "verification_key.json");
const verificationKey = JSON.parse(fs.readFileSync(verificationKeyPath, "utf8"));

// --------------------
// Health check (debug endpoint)
// --------------------
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    wasmExists: fs.existsSync(wasmPath),
    zkeyExists: fs.existsSync(zkeyPath)
  });
});

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

    const input = { age };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      wasmPath,
      zkeyPath
    );

    console.log("PUBLIC SIGNALS:", publicSignals);

    const verified = publicSignals?.[0] === "1";

    return res.json({
      success: true,
      verified,
      proof,
      publicSignals
    });
  } catch (err) {
    console.error("PROOF ERROR:", err);

    return res.status(500).json({
      success: false,
      error: err.message || "Unknown error"
    });
  }
});

// --------------------
// Verify proof endpoint
// --------------------
app.post("/verify-proof", async (req, res) => {
  try {
    const { proof, publicSignals } = req.body;

    if (!proof || !publicSignals) {
      return res.status(400).json({
        success: false,
        error: "Missing proof or publicSignals"
      });
    }

    const verifiedProof = await snarkjs.groth16.verify(
      verificationKey,
      publicSignals,
      proof
    );

    return res.json({
      success: true,
      verifiedProof
    });
  } catch (err) {
    console.error("VERIFY ERROR:", err);

    return res.status(500).json({
      success: false,
      error: err.message || "Unknown error"
    });
  }
});

// --------------------
// Start server
// --------------------
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Vyntra running on port ${PORT}`);
});