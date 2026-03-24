import type { AddressInfo } from 'node:net';

import { apiEnv } from '../../config/index.ts';
import { localHost } from '../constants.ts';

function getServerDetails(serverAddress: AddressInfo | string | null): string {
  // Use a type guard to safely check if it's an AddressInfo object
  if (serverAddress && typeof serverAddress !== 'string') {
    const {
      port,
      address: ipAddress,
    } = serverAddress as AddressInfo;

    return `... Server is listening on ${ipAddress}:${port} ${apiEnv !== 'PROD' ? `(${localHost})` : ''}`;
  }
  else if (typeof serverAddress === 'string') {
    return `...Server is listening on ${serverAddress}`;
  }

  return 'Server address information is unavailable.';
}

export {
  getServerDetails,
};
