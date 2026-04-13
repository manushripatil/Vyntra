const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ==============================
// PATHS (FIXED - NO MORE CRASHES)
// ==============================
const wasmPath = path.join(__dirname, "clean_js", "clean.wasm");
const zkeyPath = path.join(__dirname, "circuit_final.zkey");

// ==============================
// DEBUG CHECK (IMPORTANT ON RENDER)
// ==============================
console.log("===== VYNTRA SERVER BOOT =====");
console.log("__dirname:", __dirname);
console.log("WASM exists:", fs.existsSync(wasmPath));
console.log("ZKEY exists:", fs.existsSync(zkeyPath));

if (fs.existsSync(__dirname)) {
  console.log("FILES:", fs.readdirSync(__dirname));
}

// ==============================
// ROOT ROUTE
// ==============================
app.get("/", (req, res) => {
  res.send("Vyntra API Running 🚀");
});

// ==============================
// AGE PROOF ENDPOINT
// ==============================
app.post("/prove-age", async (req, res) => {
  try {
    const { age } = req.body;

    console.log("INPUT RECEIVED:", req.body);

    // fake public signal (you already use this style)
    const publicSignals = ["1"];

    console.log("PUBLIC SIGNALS:", publicSignals);

    // ==============================
    // FILE CHECK (REAL ERROR SOURCE)
    // ==============================
    if (!fs.existsSync(wasmPath) || !fs.existsSync(zkeyPath)) {
      console.error("MISSING FILES:");
      console.error("WASM:", fs.existsSync(wasmPath));
      console.error("ZKEY:", fs.existsSync(zkeyPath));

      return res.status(500).json({
        success: false,
        error: "Circuit files missing (WASM or ZKEY)",
      });
    }

    // ==============================
    // MOCK ZK PROOF LOGIC (SAFE FOR NOW)
    // Replace this with snarkjs later
    // ==============================
    const isAdult = parseInt(age) >= 16;

    const proof = {
      proof: {
        pi_a: ["0x1", "0x2"],
        pi_b: [["0x3", "0x4"], ["0x5", "0x6"]],
        pi_c: ["0x7", "0x8"],
      },
      publicSignals,
    };

    return res.json({
      success: true,
      verified: isAdult,
      proof,
    });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ==============================
// START SERVER (RENDER SAFE PORT)
// ==============================
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Vyntra API running on port ${PORT}`);
});
