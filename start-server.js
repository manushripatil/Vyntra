import app from './server.js';

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Vyntra running on port ${PORT}`);
});

export { app };
