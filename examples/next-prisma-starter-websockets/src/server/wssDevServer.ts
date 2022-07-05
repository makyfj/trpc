import { createContext } from './context';
import { appRouter } from './routers/_app';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import fetch from 'node-fetch';
import ws from 'ws';

const globalAny = globalThis as any; // 🚨 unsafe, don't do this in production
if (!globalAny.AbortController) globalAny.AbortController = AbortController;
if (!globalAny.fetch) globalAny.fetch = fetch; // 🙌 Node v18 has built-in fetch

const wss = new ws.Server({
  port: 3001,
});
const handler = applyWSSHandler({ wss, router: appRouter, createContext });

wss.on('connection', (ws) => {
  console.log(`➕➕ Connection (${wss.clients.size})`);
  ws.once('close', () => {
    console.log(`➖➖ Connection (${wss.clients.size})`);
  });
});
console.log('✅ WebSocket Server listening on ws://localhost:3001');

process.on('SIGTERM', () => {
  console.log('SIGTERM');
  handler.broadcastReconnectNotification();
  wss.close();
});
