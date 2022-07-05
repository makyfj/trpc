import AbortController from 'abort-controller';
import fetch from 'node-fetch';
import { WebSocket } from 'ws';

// polyfill fetch & websocket
const globalAny = globalThis as any; // 🚨 unsafe, don't do this in production
if (!globalAny.AbortController) globalAny.AbortController = AbortController;
if (!globalAny.fetch) globalAny.fetch = fetch; // 🙌 Node v18 has built-in fetch
if (!globalAny.WebSocket) globalAny.WebSocket = WebSocket;
