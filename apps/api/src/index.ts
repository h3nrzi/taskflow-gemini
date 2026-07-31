import { buildApp } from './app.js';

const app = buildApp();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
  console.log(`🚀 TaskFlow API service listening at ${address}`);
});
