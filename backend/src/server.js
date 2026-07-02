const app = require('./app');
const appConfig = require('./config');
const logger = require('./config/logger');
const { connectDatabase, disconnectDatabase } = require('./config/database');
const authService = require('./services/auth.service');
const { disconnectAll } = require('./blockchain/fabricGateway');

async function bootstrap() {
  await connectDatabase();
  await authService.seedDefaultUsers();

  const server = app.listen(appConfig.port, () => {
    logger.info(`MediChain HMS API listening on port ${appConfig.port}`);
    logger.info(`Environment: ${appConfig.nodeEnv}`);
    logger.info(`Fabric network path: ${appConfig.fabricNetworkPath}`);
    logger.info(`MongoDB off-chain storage enabled`);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectAll();
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  logger.error(`Failed to start server: ${err.stack || err.message}`);
  process.exit(1);
});
