import { createTRPCClient } from '@trpc/client';
import fetch from 'node-fetch';
import type { AppRouter } from './server';

const globalAny = globalThis as any; // 🚨 unsafe, don't do this in production
if (!globalAny.AbortController) globalAny.AbortController = AbortController;
if (!globalAny.fetch) globalAny.fetch = fetch; // 🙌 Node v18 has built-in fetch

const httpApiClient = createTRPCClient<AppRouter>({
  url: 'http://127.0.0.1:4050',
});
const restApiClient = createTRPCClient<AppRouter>({
  url: 'http://127.0.0.1:4050/dev',
});

(async () => {
  try {
    // A Very simple client to test showcase both APIGW v1(Rest API) and v2(HTTP API) support with serverless-offline
    const queryForVersion2 = await httpApiClient.query(
      'payloadFormatVersion',
      {},
    );
    console.log(queryForVersion2);
    const queryForVersion1 = await restApiClient.query(
      'payloadFormatVersion',
      {},
    );
    console.log(queryForVersion1);
  } catch (error) {
    console.log('error', error);
  }
})();
