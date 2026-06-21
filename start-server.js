import express from "express";
import next from "next";
import apiApp from "./server.js";

const port = process.env.PORT || 10000;
const dev = process.env.NODE_ENV !== "production";

const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

async function start() {
  await nextApp.prepare();

  const app = express();

  // Mount your existing API server
  app.use(apiApp);

  // Let Next.js handle all pages
  app.all("/{*splat}", (req, res) => {
    return handle(req, res);
  });

  app.listen(port, () => {
    console.log(`Vyntra running on port ${port}`);
  });
}

start().catch((err) => {
  console.error("Startup error:", err);
  process.exit(1);
});