import server from '../build/server/index.js';

function getHandler(mod) {
  if (typeof mod === 'function') return mod;
  if (mod && typeof mod.fetch === 'function') return mod.fetch.bind(mod);
  if (mod && typeof mod.default === 'function') return mod.default;
  throw new Error('Unsupported server export in build/server/index.js');
}

const handler = getHandler(server);

export default async function vercelHandler(request) {
  const url = new URL(request.url);
  const forcedPathname = url.searchParams.get('__pathname');

  if (forcedPathname) {
    url.pathname = forcedPathname;
    url.searchParams.delete('__pathname');
    request = new Request(url.toString(), request);
  }

  return handler(request);
}
