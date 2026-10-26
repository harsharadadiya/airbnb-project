// Entry point: connect to MongoDB, then start the HTTP server.
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { createApp } from './app.js';

await connectDB();

const app = createApp();
const server = app.listen(env.PORT, () => {
  console.log(`🚀 StayNest API running at http://localhost:${env.PORT}/api (${env.NODE_ENV})`);
});

// Close everything cleanly when the process is stopped (Ctrl+C or by the hosting platform)
async function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down...`);
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled promise rejection:', reason);
});
