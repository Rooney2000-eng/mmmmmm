import { Hono } from 'hono';
import type { Handler } from 'hono/types';
import updatedFetch from '../src/__create/fetch';

const API_BASENAME = '/api';
const api = new Hono();

if (globalThis.fetch) {
  globalThis.fetch = updatedFetch;
}

type RouteModule = Partial<Record<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', Handler>>;

function getHonoPathFromGlobKey(routeKey: string): string {
  const relativePath = routeKey.replace(/^\.\.\/src\/app\/api\//, '');
  const routePath = relativePath.replace(/\/route\.js$/, '');

  if (!routePath) return '/';

  const transformedParts = routePath
    .split('/')
    .filter(Boolean)
    .map((segment) => {
      const match = segment.match(/^\[(\.\.\.)?([^\]]+)\]$/);
      if (match) {
        const [, dots, param] = match;
        return dots ? `:${param}{.+}` : `:${param}`;
      }
      return segment;
    });

  return `/${transformedParts.join('/')}`;
}

function registerRoutes() {
  api.routes = [];

  const routeModules = import.meta.glob('../src/app/api/**/route.js', {
    eager: true,
  }) as Record<string, RouteModule>;

  const sortedRouteEntries = Object.entries(routeModules).sort(([a], [b]) => b.length - a.length);

  for (const [routeKey, route] of sortedRouteEntries) {
    const honoPath = getHonoPathFromGlobKey(routeKey);
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;

    for (const method of methods) {
      const routeHandler = route[method];
      if (!routeHandler) continue;

      const handler: Handler = async (c) => {
        const params = c.req.param();
        return await routeHandler(c.req.raw, { params } as { params: Record<string, string> });
      };

      switch (method) {
        case 'GET':
          api.get(honoPath, handler);
          break;
        case 'POST':
          api.post(honoPath, handler);
          break;
        case 'PUT':
          api.put(honoPath, handler);
          break;
        case 'DELETE':
          api.delete(honoPath, handler);
          break;
        case 'PATCH':
          api.patch(honoPath, handler);
          break;
      }
    }
  }
}

registerRoutes();

if (import.meta.env.DEV && import.meta.hot) {
  import.meta.hot.accept(() => {
    try {
      registerRoutes();
    } catch (err) {
      console.error('Error reloading routes:', err);
    }
  });
}

export { api, API_BASENAME };
