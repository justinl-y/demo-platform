import buildInstance from './build-instance.ts';
import { Config } from '#config/index';
import { getServerDetails } from '#utils/functions';
import { localHost } from '#utils/constants';

const PM2_VERSION = 'v6.0.14';
const NODE_VERSION = process.version;

async function startServer() {
  try {
    console.log('-----------------------------------------------------------------------------\r\n');
    console.log(`\r\nPM2 version is: ${PM2_VERSION}`);
    console.log(`Node version is: ${NODE_VERSION}`);
    console.log('\r\nServer starting ...');
    console.log(`... API environment is ${Config.apiEnv}`);
    console.log(`... Resource environment is ${Config.apiResourceEnv}`);

    const instance = await buildInstance();

    await instance.listen(Config.serverConfig);

    console.log(getServerDetails(instance.server.address()));

    if (Config.apiEnv !== 'PROD') console.log(`... API documentation available at ${localHost}/api-docs`);
    console.log('Server ready, let the magic begin!');
    console.log('\r\n-----------------------------------------------------------------------------\r\n');
  }
  catch (err) {
    console.log(err);

    process.exit(1);
  }
};

await startServer();
