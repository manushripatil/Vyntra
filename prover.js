const { execSync } = require("child_process");
const fs = require("fs");

function proveAge(age) {
    // 1. Write input
    fs.writeFileSync("input.json", JSON.stringify({ age }));

    // 2. Generate witness
    execSync("node clean_js/generate_witness.js clean_js/clean.wasm input.json witness.wtns");

    // 3. Generate proof
    execSync("npx snarkjs groth16 prove circuit_final.zkey witness.wtns proof.json public.json");

    // 4. Read outputs
    const proof = JSON.parse(fs.readFileSync("proof.json"));
    const publicSignals = JSON.parse(fs.readFileSync("public.json"));

    return { proof, publicSignals };
}

// test run
const result = proveAge(18);
console.log(result);