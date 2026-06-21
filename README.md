# Vyntra

Vyntra is a Zero-Knowledge Proof age verification system that enables users to prove they meet an age requirement without revealing their actual age.

## Run locally

1. Install dependencies

```bash
npm install
```

2. Start the backend and frontend together

```bash
npm run dev:all
```

3. Open the app

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:10000`

## Scripts

- `npm run dev` — start Next development server
- `npm run start` — start Express server
- `npm run dev:all` — run frontend and backend concurrently
- `npm run build` — build the Next app
- `npm run test` — run integration tests
- `npm run smoke` — run the smoke test script

## Optional production configuration

- Set `REDIS_URL` to enable Redis-backed rate limiting.
- Set `ISSUER_TOKEN` to protect the issuance endpoint.

## Notes

- `server.js` exports the app for tests.
- `start-server.js` launches the HTTP listener.
- `src/pages/verify.tsx` includes proof export to JSON.

## Current state

- Full Next build passes locally.
- Integration and smoke tests pass.
- `vyntra-frontend` legacy folder has been removed.

