# Vyntra V1 — Zero Knowledge Age Verification

## Overview
Vyntra V1 is a prototype that demonstrates privacy-preserving age verification using Zero-Knowledge Proofs (ZKPs). It verifies whether a user is 16 or older without revealing their actual age.

## Problem
Most systems require users to share sensitive personal data (like date of birth or ID) just to prove something simple like age eligibility. This creates unnecessary privacy risks and data exposure.

## Solution
Vyntra uses Zero-Knowledge Proofs to allow a user to prove:
"I am 16 or older"
without revealing the actual age.

## How It Works
1. User enters their age in the frontend
2. Backend generates a ZK proof using a Circom circuit
3. Proof is verified using SnarkJS
4. Server returns a verification result:
   - Verified (age ≥ 16)
   - Not verified (age < 16)

## Architecture
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js (Express server)
- ZK Circuit: Circom
- Proof System: SnarkJS (Groth16)

## Project Flow
Frontend → sends age → Backend → generates proof → verifies proof → returns result

## How to Run

### Install dependencies
```bash
npm install
```

### Start server
```bash
node server.js
```

### Open in browser
http://localhost:3000

## Expected Behavior
Input: 15 → Not Verified  
Input: 16 → Verified

## Files Included
- server.js — backend API handling proof generation and verification
- clean.circom — ZK circuit logic
- build/ — compiled circuit artifacts
- public/ — frontend UI
- verification_key.json — verification key
- circuit_final.zkey — trusted setup artifact

## Limitations (V1)
- Local prototype only
- Simplified age check circuit
- No identity binding
- No Polygon ID integration

## Future Work
- Polygon ID integration
- Decentralized identity graph
- Token-based verification incentives
- Production deployment

## Demo
(Add your demo video link here)

## Author
Vyntra V1 Prototype
