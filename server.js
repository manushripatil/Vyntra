const express = require("express");
const bodyParser = require("body-parser");
const snarkjs = require("snarkjs");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());

// IMPORTANT for deployment (Render / cloud)
const PORT = process.env.PORT || 3000;

// Serve frontend
app.use(express.static("public"));

app.post("/prove-age", async (req, res) => {
    try {
        console.log("INPUT RECEIVED:", req.body);

        const age = req.body.age;

        if (age === undefined || age === null) {
            return res.status(400).json({
                success: false,
                error: "Age not provided"
            });
        }

        // Example constraint: age >= 16
        const input = {
            age: Number(age)
        };

        console.log("PUBLIC SIGNALS:", [age >= 16 ? "1" : "0"]);

        // Paths (make sure these files exist)
        const wasmPath = "./clean_js/clean.wasm";
        const zkeyPath = "./circuit_final.zkey";

        if (!fs.existsSync(wasmPath) || !fs.existsSync(zkeyPath)) {
            throw new Error("Circuit files missing (WASM or ZKEY)");
        }

        // Generate witness + proof
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            input,
            wasmPath,
            zkeyPath
        );

        // Load verification key
        const vKey = JSON.parse(
            fs.readFileSync("./verification_key.json")
        );

        // Verify proof
        const verified = await snarkjs.groth16.verify(
            vKey,
            publicSignals,
            proof
        );

        console.log("VERIFIED:", verified);

        res.json({
            success: true,
            verified,
            publicSignals
        });

    } catch (err) {
        console.error("SERVER ERROR:", err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Vyntra API running on http://localhost:${PORT}`);
});
