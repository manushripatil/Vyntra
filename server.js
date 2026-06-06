import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import * as snarkjs from "snarkjs";
import { fileURLToPath } from "url";
import { createHash, randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------
// App setup
// --------------------
const app = express();

// CORS: allow only configured origin (useful in prod/dev)
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:3000";
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin like curl/postman
      if (!origin) return callback(null, true);
      if (origin === ALLOWED_ORIGIN) return callback(null, true);
      return callback(new Error("CORS_NOT_ALLOWED"));
    },
  })
);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --------------------
// Circuit paths
// --------------------
const wasmPath = path.join(__dirname, "clean_js", "clean.wasm");
const zkeyPath = path.join(__dirname, "circuit_final.zkey");
const verificationKeyPath = path.join(__dirname, "verification_key.json");

// Startup checks for required artifacts
function assertExists(p, name) {
  if (!fs.existsSync(p)) {
    console.error(`Required file missing: ${name} at ${p}`);
    process.exit(1);
  }
}

assertExists(wasmPath, "clean.wasm");
assertExists(zkeyPath, "circuit_final.zkey");
assertExists(verificationKeyPath, "verification_key.json");

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

// Simple in-memory rate limiter (per-IP, sliding window)
const rateWindowMs = Number(process.env.RATE_WINDOW_MS || 60_000);
const rateMax = Number(process.env.RATE_MAX || 30);
const rateMap = new Map();

app.use((req, res, next) => {
  try {
    const key = req.ip || req.connection.remoteAddress || "unknown";
    const now = Date.now();
    const entry = rateMap.get(key) || { ts: now, count: 0 };
    if (now - entry.ts > rateWindowMs) {
      entry.ts = now;
      entry.count = 0;
    }
    entry.count += 1;
    rateMap.set(key, entry);
    if (entry.count > rateMax) {
      return res.status(429).json({ success: false, error: "Too many requests" });
    }
    next();
  } catch (err) {
    next();
  }
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
// Issue credential endpoint (server-side issuance)
// --------------------
app.post("/issue", async (req, res) => {
  try {
    const token = req.headers["x-issuer-token"] || req.headers["authorization"]?.toString().replace(/^Bearer\s+/, "");
    const expected = process.env.ISSUER_TOKEN || process.env.NEXT_PUBLIC_ISSUER_TOKEN || "dev-token";

    // In production require a matching token
    if (process.env.NODE_ENV === "production" && token !== expected) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const age = Number(req.body.age);
    if (!age || Number.isNaN(age)) {
      return res.status(400).json({ success: false, error: "Invalid age" });
    }

    const credentialId = (randomUUID && randomUUID()) || `id-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
    const issuedAt = Date.now();

    const payload = { credentialId, age, issuedAt };
    const signature = createHash("sha256").update(JSON.stringify(payload)).digest("hex");

    const credential = {
      credentialId,
      issuer: "DemoGov",
      age,
      issuedAt,
      signature,
    };

    return res.json({ success: true, credential });
  } catch (err) {
    console.error("ISSUE ERROR:", err);
    return res.status(500).json({ success: false, error: err.message || "Unknown error" });
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