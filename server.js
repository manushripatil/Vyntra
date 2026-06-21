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

// CORS: allow only configured origin (useful in prod/dev)
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "";
const isDev = process.env.NODE_ENV !== "production";

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("Request origin:", origin);
      console.log("Allowed origin:", ALLOWED_ORIGIN);

      // Allow requests with no origin like curl/postman
      if (!origin) return callback(null, true);
      // In development, allow any localhost origin
      if (isDev && origin.startsWith("http://localhost:")) return callback(null, true);
      if (isDev && origin.startsWith("http://127.0.0.1:")) return callback(null, true);
      // In production, allow the configured origin only
      if (origin === ALLOWED_ORIGIN) return callback(null, true);

      console.warn("Rejected CORS origin:", origin);
      return callback(new Error("CORS_NOT_ALLOWED"));
    },
  })
);

app.use(express.json());

// Serve legacy static frontend only when explicitly enabled or in production.
// This avoids conflicts with a Next.js dev server running on a different port.
if (process.env.SERVE_LEGACY_STATIC === "true" || process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "public")));
}

// --------------------
// Circuit paths
// --------------------
const wasmPath = path.join(__dirname, "clean_js", "clean.wasm");
const zkeyPath = path.join(__dirname, "circuit_final.zkey");
const verificationKeyPath = path.join(__dirname, "verification_key.json");

// Startup checks for required artifacts
function assertExists(p, name) {
  console.log(`Checking for ${name} at ${p}...`);
  if (!fs.existsSync(p)) {
    console.error(`Required file missing: ${name} at ${p}`);
    process.exit(1);
  }
  console.log(`✓ Found ${name}`);
}

assertExists(wasmPath, "clean.wasm");
assertExists(zkeyPath, "circuit_final.zkey");
assertExists(verificationKeyPath, "verification_key.json");
console.log("✓ All required files found");

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

// Optional Redis-backed limiter when REDIS_URL is set (production)
let redisClient = null;
if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL);
    redisClient.on('error', (e) => console.error('Redis error', e));
  } catch (e) {
    console.error('Failed to initialize Redis client, falling back to in-memory limiter', e);
    redisClient = null;
  }
}

app.use(async (req, res, next) => {
  try {
    const key = `rate:${req.ip || req.connection.remoteAddress || 'unknown'}`;

    if (redisClient) {
      const count = await redisClient.incr(key);
      if (count === 1) {
        await redisClient.expire(key, Math.ceil(rateWindowMs / 1000));
      }
      if (count > rateMax) {
        return res.status(429).json({ success: false, error: 'Too many requests' });
      }
      return next();
    }

    // Fallback to in-memory limiter
    const now = Date.now();
    const entry = rateMap.get(key) || { ts: now, count: 0 };
    if (now - entry.ts > rateWindowMs) {
      entry.ts = now;
      entry.count = 0;
    }
    entry.count += 1;
    rateMap.set(key, entry);
    if (entry.count > rateMax) {
      return res.status(429).json({ success: false, error: 'Too many requests' });
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

// Export the app so tests or external runners can import it without starting the server.
export default app;