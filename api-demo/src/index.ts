import buildInstance from './build-instance.ts';
import { Config } from '#config/index';
import { getServerDetails } from '#utils/functions';
import { localHost } from '#utils/constants';
import { createLogger } from '#utils/logger';

const PM2_VERSION = 'v6.0.14';
const NODE_VERSION = process.version;

const logger = createLogger();

async function startServer() {
  try {
    logger.info('-----------------------------------------------------------------------------\r\n');
    logger.info(`\r\nPM2 version is: ${PM2_VERSION}`);
    logger.info(`Node version is: ${NODE_VERSION}`);
    logger.info('\r\nServer starting ...');
    logger.info(`... API environment is ${Config.apiEnv}`);
    logger.info(`... Resource environment is ${Config.apiResourceEnv}`);

    const instance = await buildInstance();

    await instance.listen(Config.serverConfig);

    logger.info(getServerDetails(instance.server.address()));

    if (!['PROD', 'STAGE'].includes(Config.apiEnv)) logger.info(`... API documentation available at ${localHost}/api-docs`);
    logger.info('Server ready, let the magic begin!');
    logger.info('\r\n-----------------------------------------------------------------------------\r\n');
  }
  catch (err) {
    logger.error(err);

    process.exit(1);
  }
};

await startServer();
