import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import * as snarkjs from "snarkjs";
import { fileURLToPath } from "url";
import { createHash, randomUUID } from "crypto";
import Redis from "ioredis";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------
// App setup
// --------------------
const app = express();

const isDev = process.env.NODE_ENV !== "production";

// Accept multiple origins safely
const allowedOrigins = new Set(
  [
    process.env.ALLOWED_ORIGIN,
    "http://localhost:3000",
  ].filter(Boolean)
);

// --------------------
// CORS (FIXED)
// --------------------
app.use(
  cors({
    origin: (origin, callback) => {
      console.log("Request origin:", origin);

      // Allow server-to-server / curl / mobile apps
      if (!origin) return callback(null, true);

      // Dev mode: allow everything local
      if (isDev && origin.startsWith("http://localhost")) {
        return callback(null, true);
      }

      // Production allowlist
      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      console.warn("Rejected CORS origin:", origin);
      console.warn("Allowed origins:", [...allowedOrigins]);

      // IMPORTANT: do NOT throw error here (Express 5 can crash)
      return callback(null, false);
    },
  })
);

app.use(express.json());

// --------------------
// Static files (optional)
// --------------------
if (process.env.SERVE_LEGACY_STATIC === "true" || !isDev) {
  app.use(express.static(path.join(__dirname, "public")));
}

// --------------------
// Circuit paths
// --------------------
const wasmPath = path.join(__dirname, "clean_js", "clean.wasm");
const zkeyPath = path.join(__dirname, "circuit_final.zkey");
const verificationKeyPath = path.join(__dirname, "verification_key.json");

function assertExists(p, name) {
  console.log(`Checking for ${name} at ${p}...`);
  if (!fs.existsSync(p)) {
    console.error(`Missing: ${name}`);
    process.exit(1);
  }
  console.log(`✓ Found ${name}`);
}

assertExists(wasmPath, "clean.wasm");
assertExists(zkeyPath, "circuit_final.zkey");
assertExists(verificationKeyPath, "verification_key.json");

const verificationKey = JSON.parse(
  fs.readFileSync(verificationKeyPath, "utf8")
);

// --------------------
// Health check
// --------------------
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    wasmExists: fs.existsSync(wasmPath),
    zkeyExists: fs.existsSync(zkeyPath),
  });
});

// --------------------
// Rate limiting
// --------------------
const rateWindowMs = Number(process.env.RATE_WINDOW_MS || 60_000);
const rateMax = Number(process.env.RATE_MAX || 30);
const rateMap = new Map();

let redisClient = null;

if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL);
    redisClient.on("error", (e) => console.error("Redis error", e));
  } catch (e) {
    redisClient = null;
  }
}

app.use(async (req, res, next) => {
  try {
    const key = `rate:${req.ip || "unknown"}`;

    if (redisClient) {
      const count = await redisClient.incr(key);
      if (count === 1) {
        await redisClient.expire(key, Math.ceil(rateWindowMs / 1000));
      }
      if (count > rateMax) {
        return res.status(429).json({ error: "Too many requests" });
      }
      return next();
    }

    const now = Date.now();
    const entry = rateMap.get(key) || { ts: now, count: 0 };

    if (now - entry.ts > rateWindowMs) {
      entry.ts = now;
      entry.count = 0;
    }

    entry.count++;
    rateMap.set(key, entry);

    if (entry.count > rateMax) {
      return res.status(429).json({ error: "Too many requests" });
    }

    next();
  } catch {
    next();
  }
});

// --------------------
// ZK PROOF
// --------------------
app.post("/prove-age", async (req, res) => {
  try {
    const age = Number(req.body.age);

    if (!age || Number.isNaN(age)) {
      return res.status(400).json({ success: false, error: "Invalid age" });
    }

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      { age },
      wasmPath,
      zkeyPath
    );

    return res.json({
      success: true,
      verified: publicSignals?.[0] === "1",
      proof,
      publicSignals,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// --------------------
// ISSUE CREDENTIAL
// --------------------
app.post("/issue", (req, res) => {
  try {
    const age = Number(req.body.age);

    if (!age || Number.isNaN(age)) {
      return res.status(400).json({ success: false, error: "Invalid age" });
    }

    const credentialId = randomUUID();
    const issuedAt = Date.now();

    const payload = { credentialId, age, issuedAt };
    const signature = createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex");

    return res.json({
      success: true,
      credential: {
        credentialId,
        issuer: "DemoGov",
        age,
        issuedAt,
        signature,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// --------------------
// VERIFY PROOF
// --------------------
app.post("/verify-proof", async (req, res) => {
  try {
    const { proof, publicSignals } = req.body;

    if (!proof || !publicSignals) {
      return res.status(400).json({
        success: false,
        error: "Missing proof or publicSignals",
      });
    }

    const verifiedProof = await snarkjs.groth16.verify(
      verificationKey,
      publicSignals,
      proof
    );

    return res.json({
      success: true,
      verifiedProof,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

export default app;