const app = require('./src/app');
const config = require('./src/config/environment');
const { connectDB, disconnectDB } = require('./src/config/db');
const cacheClient = require('./src/config/redis');

let server = null;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Start HTTP listener
    server = app.listen(config.port, () => {
      console.log(`===============================================`);
      console.log(`🌿 EcoQuest Server listening on port ${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Frontend Allowed Origin: ${config.frontendUrl}`);
      console.log(`===============================================`);
    });

    // 3. Graceful shutdown listeners
    const shutdown = async (signal) => {
      console.log(`\n[Process] Received ${signal}. Starting graceful shutdown...`);

      if (server) {
        server.close(async () => {
          console.log('[Server] HTTP listener closed.');
          try {
            await disconnectDB();
            await cacheClient.quit();
            console.log('[Server] All services disconnected cleanly. Exiting.');
            process.exit(0);
          } catch (err) {
            console.error('[Shutdown Error]', err);
            process.exit(1);
          }
        });
      } else {
        process.exit(0);
      }

      // Force terminate after 10s if hanging
      setTimeout(() => {
        console.error('[Server] Graceful shutdown timed out. Forcing termination.');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error) {
    console.error('[Server Initialization Error]', error);
    process.exit(1);
  }
};

startServer();
