import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import snarkjs from "snarkjs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const wasmPath = path.join(__dirname, "clean_js", "clean.wasm");
const zkeyPath = path.join(__dirname, "circuit_final.zkey");

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    wasmExists: fs.existsSync(wasmPath),
    zkeyExists: fs.existsSync(zkeyPath)
  });
});

app.post("/prove-age", async (req, res) => {
  try {
    const age = parseInt(req.body.age);

    if (isNaN(age)) {
      return res.status(400).json({ success: false, error: "Invalid age" });
    }

    const input = { age };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      wasmPath,
      zkeyPath
    );

    const isAllowed = publicSignals[0] === "1";

    res.json({
      success: true,
      verified: isAllowed,
      publicSignals
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Vyntra running on port", PORT);
});
