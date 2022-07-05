import { createTRPCClient } from '@trpc/client';
import fetch from 'node-fetch';
import type { AppRouter } from './server';

const globalAny = globalThis as any; // 🚨 unsafe, don't do this in production
if (!globalAny.AbortController) globalAny.AbortController = AbortController;
if (!globalAny.fetch) globalAny.fetch = fetch; // 🙌 Node v18 has built-in fetch

const client = createTRPCClient<AppRouter>({ url: 'http://127.0.0.1:4050' });

(async () => {
  try {
    const q = await client.query('greet', { name: 'Erik' });
    console.log(q);
  } catch (error) {
    console.log('error', error);
  }
})();
