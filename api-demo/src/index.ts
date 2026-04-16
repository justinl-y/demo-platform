import buildInstance from './build-instance.ts';
import { Config } from '#config/index';
import { getServerDetails } from '#utils/functions';
import { localHost } from '#utils/constants';
import { createLogger } from '#lib/logger';

const PM2_VERSION = 'v6.0.14';
const NODE_VERSION = process.version;
const logger = createLogger();

async function startServer() {
  try {
    console.info('-----------------------------------------------------------------------------\r\n');
    console.info(`\r\nPM2 version is: ${PM2_VERSION}`);
    console.info(`Node version is: ${NODE_VERSION}`);
    console.info('\r\nServer starting ...');
    console.info(`... API environment is ${Config.apiEnv}`);
    console.info(`... Resource environment is ${Config.apiResourceEnv}`);

    const instance = await buildInstance();

    await instance.listen(Config.serverConfig);

    console.info(getServerDetails(instance.server.address()));

    if (!Config.liveEnvironments.includes(Config.apiEnv)) console.info(`... API documentation available at ${localHost}/api-docs`);
    console.info('Server ready, let the magic begin!');
    console.info('\r\n-----------------------------------------------------------------------------\r\n');
  }
  catch (err) {
    logger.error(err);

    process.exit(1);
  }
};

await startServer();
