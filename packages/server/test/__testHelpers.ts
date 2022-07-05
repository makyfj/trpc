/* eslint-disable @typescript-eslint/ban-types */

/* eslint-disable @typescript-eslint/no-explicit-any */
import './__packages';
import { CreateTRPCClientOptions, createTRPCClient } from '@trpc/client';
import {
  TRPCWebSocketClient,
  WebSocketClientOptions,
  createWSClient,
} from '@trpc/client/links/wsLink';
import AbortController from 'abort-controller';
import fetch from 'node-fetch';
import ws from 'ws';
import { AnyRouter } from '../src';
import {
  CreateHTTPHandlerOptions,
  createHTTPServer,
} from '../src/adapters/standalone';
import { WSSHandlerOptions, applyWSSHandler } from '../src/adapters/ws';

const globalAny = globalThis as any; // 🚨 unsafe, don't do this in production
if (!globalAny.AbortController) globalAny.AbortController = AbortController;
if (!globalAny.fetch) globalAny.fetch = fetch; // 🙌 Node v18 has built-in fetch

export function routerToServerAndClient<TRouter extends AnyRouter>(
  router: TRouter,
  opts?: {
    server?: Partial<CreateHTTPHandlerOptions<TRouter>>;
    wssServer?: Partial<WSSHandlerOptions<TRouter>>;
    wsClient?: Partial<WebSocketClientOptions>;
    client?:
      | Partial<CreateTRPCClientOptions<TRouter>>
      | ((opts: {
          httpUrl: string;
          wssUrl: string;
          wsClient: TRPCWebSocketClient;
        }) => Partial<CreateTRPCClientOptions<TRouter>>);
  },
) {
  // http
  const httpServer = createHTTPServer({
    router,
    createContext: ({ req, res }) => ({ req, res }),
    ...(opts?.server ?? {
      batching: {
        enabled: true,
      },
    }),
  });
  const { port: httpPort } = httpServer.listen(0);
  const httpUrl = `http://localhost:${httpPort}`;

  // wss
  const wss = new ws.Server({ port: 0 });
  const wssPort = (wss.address() as any).port as number;
  const applyWSSHandlerOpts: WSSHandlerOptions<TRouter> = {
    wss,
    router,
    createContext: ({ req, res }) => ({ req, res }),
    ...((opts?.wssServer as any) ?? {}),
  };
  const wssHandler = applyWSSHandler(applyWSSHandlerOpts);
  const wssUrl = `ws://localhost:${wssPort}`;

  // client
  const wsClient = createWSClient({
    url: wssUrl,
    ...opts?.wsClient,
  });
  const trpcClientOptions: CreateTRPCClientOptions<typeof router> = {
    url: httpUrl,
    ...(opts?.client
      ? typeof opts.client === 'function'
        ? opts.client({ httpUrl, wssUrl, wsClient })
        : opts.client
      : {}),
  };
  const client = createTRPCClient<typeof router>(trpcClientOptions);
  return {
    wsClient,
    client,
    close: async () => {
      await Promise.all([
        new Promise((resolve) => httpServer.server.close(resolve)),
        new Promise((resolve) => {
          wss.clients.forEach((ws) => ws.close());
          wss.close(resolve);
        }),
      ]);
    },
    router,
    trpcClientOptions,
    httpPort,
    /**
     * @deprecated
     */
    port: httpPort,
    wssPort,
    httpUrl,
    wssUrl,
    applyWSSHandlerOpts,
    wssHandler,
    wss,
  };
}

export async function waitMs(ms: number) {
  await new Promise<void>((resolve) => setTimeout(resolve, ms));
}

type Constructor<T extends {} = {}> = new (...args: any[]) => T;

export async function waitError<TError = Error>(
  /**
   * Function callback or promise that you expect will throw
   */
  fnOrPromise: (() => Promise<unknown> | unknown) | Promise<unknown>,
  /**
   * Force error constructor to be of specific type
   * @default Error
   **/
  errorConstructor?: Constructor<TError>,
): Promise<TError> {
  try {
    if (typeof fnOrPromise === 'function') {
      await fnOrPromise();
    } else {
      await fnOrPromise;
    }
  } catch (cause) {
    expect(cause).toBeInstanceOf(errorConstructor ?? Error);
    return cause as TError;
  }
  throw new Error('Function did not throw');
}
