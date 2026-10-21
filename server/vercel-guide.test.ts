import { createServer, type Server } from 'node:http';
import { afterEach, expect, it, vi } from 'vitest';
import { createVercelGuideHandler } from './vercel-guide';

const servers: Server[] = [];
afterEach(async () => {
  await Promise.all(servers.splice(0).map(server => new Promise<void>(resolve => {
    server.closeAllConnections();
    server.close(() => resolve());
  })));
});

async function serve(body: unknown, malformed = false) {
  const fetcher = vi.fn(async () => Response.json({
    status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: 'Historical context.', annotations: [] }] }],
  }));
  const handler = createVercelGuideHandler({ apiKey: 'test-key', fetcher: fetcher as typeof fetch });
  const completed: string[] = [];
  const server = createServer((req, res) => {
    Object.defineProperty(req, 'body', { get() {
      if (malformed) throw new Error('Malformed JSON with private diagnostics');
      return body;
    } });
    void handler(req, res).then(() => completed.push(req.url!));
  });
  servers.push(server);
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('No test address');
  const origin = `http://127.0.0.1:${address.port}`;
  return { origin, fetcher, completed };
}

const input = { question: 'Tell me about Abai.', locale: 'en', placeId: 'semey' };

it('accepts a platform-parsed JSON body and waits for the HTTP response', async () => {
  const { origin, fetcher, completed } = await serve(input);
  const response = await fetch(origin + '/api/guide', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(input),
  });
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ answer: 'Historical context.' });
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(completed).toContain('/api/guide');
});

it('rejects a malformed body getter without leaking diagnostics or making a paid call', async () => {
  const { origin, fetcher } = await serve(undefined, true);
  const response = await fetch(origin + '/api/guide', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ error: { code: 'invalid_json' } });
  expect(fetcher).not.toHaveBeenCalled();
});

it('enforces the byte limit on parsed bodies before contacting the provider', async () => {
  const { origin, fetcher } = await serve({ ...input, padding: 'қ'.repeat(49_000) });
  const response = await fetch(origin + '/api/guide', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  expect(response.status).toBe(413);
  expect(fetcher).not.toHaveBeenCalled();
});

it('serves status and an unknown route with completed responses', async () => {
  const { origin, fetcher } = await serve(undefined);
  expect(await (await fetch(origin + '/api/guide/status')).json()).toEqual({ configured: true, webSearch: false });
  expect((await fetch(origin + '/api/missing')).status).toBe(404);
  expect(fetcher).not.toHaveBeenCalled();
});
