import buildInstance from './build-instance.ts';
import { apiEnv, serverConfig } from '#config/api';
import { getServerDetails } from '#utils/functions/safe-typing';
import { localHost } from '#utils/constants';

const instance = await buildInstance();

const PM2_VERSION = 'v6.0.14';
const NODE_VERSION = process.version;

async function startServer() {
  try {
    console.log('-----------------------------------------------------------------------------\r\n');
    console.log(`\r\nPM2 version is: ${PM2_VERSION}`);
    console.log(`Node version is: ${NODE_VERSION}`);
    console.log('\r\nServer starting ...');

    await instance.listen(serverConfig);

    console.log(`... API environment is ${apiEnv}`);
    console.log(getServerDetails(instance.server.address()));

    if (apiEnv !== 'PROD') console.log(`... API documentation available at ${localHost}/api-docs`);
    console.log('Server ready, let the magic begin!');
    console.log('\r\n-----------------------------------------------------------------------------\r\n');
  }
  catch (err) {
    console.log(err);

    process.exit(1);
  }
};

await startServer();
