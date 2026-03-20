import buildInstance from './build-instance.js';
import { apiEnv, server } from './config/index.js';
import { getServerDetails } from './util/functions/safe-typing.js';
import { localHost } from './util/constants.js';

const instance = await buildInstance();

const PM2_VERSION = 'v6.0.14';
const NODE_VERSION = process.version;

const startServer = async () => {
  try {
    console.log('-----------------------------------------------------------------------------\r\n');
    console.log(`\r\nPM2 version is: ${PM2_VERSION}`);
    console.log(`Node version is: ${NODE_VERSION}`);
    console.log('\r\nServer starting ...');

    await instance.listen(server);

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
