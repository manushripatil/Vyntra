# Vyntra 

Vyntra is a Zero-Knowledge Proof age verification system that enables users to prove they meet an age requirement without revealing their actual age.

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

- Currently set to 1 age restriction (16+)
- Designed as a prototype/demo 

## Future Improvements  
- Make it more customizable as a service (choosing specific age restriction for developer integration)
- Require authorized credential (mock credential at the moment)
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


## Author

Manushri Patil
