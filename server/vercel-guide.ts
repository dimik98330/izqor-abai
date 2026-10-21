import type { IncomingMessage, ServerResponse } from 'node:http';
import { createGuideMiddleware } from './guide.ts';

export function createVercelGuideHandler(options: Parameters<typeof createGuideMiddleware>[0]) {
  const middleware = createGuideMiddleware(options);
  return (req: IncomingMessage, res: ServerResponse): Promise<void> => new Promise(resolve => {
    const done = () => {
      res.off('finish', done);
      res.off('close', done);
      resolve();
    };
    res.once('finish', done);
    res.once('close', done);
    middleware(req, res, () => {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ error: { code: 'not_found' } }));
    });
  });
}
