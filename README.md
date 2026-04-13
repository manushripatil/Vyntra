# Vyntra 

Vyntra is a Zero-Knowledge Proof (ZKP) based age verification system that allows users to prove they meet an age requirement without revealing their actual age.

---

## Live Demo

https://vyntra-4rae.onrender.com

---

## What It Does

- Takes a user's age as input  
- Generates a Zero-Knowledge Proof using Circom + snarkjs  
- Verifies whether the user meets the required age threshold (e.g. 16+)  
- Returns a proof without exposing the original input  

---

## Tech Stack

- Circom – ZK circuit definition  
- snarkjs – Proof generation (Groth16)  
- Node.js (Express) – Backend API  
- HTML + JavaScript – Frontend  
- Render – Deployment  

---

## 📂 Project Structure

vyntra/


---

## How It Works

1. User enters age in the frontend  
2. Frontend sends request to /prove-age  
3. Backend:
   - Runs snarkjs.groth16.fullProve  
   - Generates proof using .wasm + .zkey  
4. Returns:
   - proof  
   - publicSignals  
   - verified: true/false  

---

##  Example Response

{
  "success": true,
  "verified": true,
  "proof": { ... },
  "publicSignals": ["1"]
}

---

## Current Limitations

- Proof is generated server-side (not fully trustless)  
- User input is not yet cryptographically committed  
- No external proof verification endpoint  
- Designed as a prototype/demo  

---

##  Run Locally

1. Install dependencies  
npm install  

2. Compile circuit  
circom clean.circom --r1cs --wasm --sym -l node_modules  

3. Setup proving key  
snarkjs groth16 setup clean.r1cs pot12_final.ptau circuit_0000.zkey  
snarkjs zkey contribute circuit_0000.zkey circuit_final.zkey --name="1" -v  

4. Start server  
node server.js  

---

## Future Improvements

- Client-side proof generation  
- On-chain verification 
- Identity commitments instead of raw age  
- API for third-party integrations  


## Author

Manushri Patil
