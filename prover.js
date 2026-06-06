import { execSync } from "child_process";
import fs from "fs";

function proveAge(age) {
    // 1. Write input
    fs.writeFileSync("input.json", JSON.stringify({ age }), "utf8");

    // 2. Generate witness
    execSync("node clean_js/generate_witness.js clean_js/clean.wasm input.json witness.wtns", {
        stdio: "inherit"
    });

    // 3. Generate proof
    execSync("npx snarkjs groth16 prove circuit_final.zkey witness.wtns proof.json public.json", {
        stdio: "inherit"
    });

    // 4. Read outputs
    const proof = JSON.parse(fs.readFileSync("proof.json", "utf8"));
    const publicSignals = JSON.parse(fs.readFileSync("public.json", "utf8"));

    return { proof, publicSignals };
}

const result = proveAge(18);
console.log(result);