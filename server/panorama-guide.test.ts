import { createServer, type Server } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createGuideMiddleware, panoramaInstructions, validatePanoramaInput } from './guide';
import { places } from '../src/content';
const tour = places.find(place => place.id === 'borili')!.tours[0];
const input = { question: 'Что я вижу?', locale: 'ru', placeId: 'borili', tourUrl: tour.url };
// Header-valid synthetic bytes test the HTTP boundary; live image decoding is checked separately.
const image = 'data:image/jpeg;base64,' + Buffer.from([255,216,255,...new Array(120).fill(0),255,217]).toString('base64');
const servers: Server[] = [];
afterEach(async () => { await Promise.all(servers.splice(0).map(server => new Promise<void>(resolve => { server.closeAllConnections(); server.close(() => resolve()); }))); });
async function serve(options: Parameters<typeof createGuideMiddleware>[0]) {
  const middleware = createGuideMiddleware(options);
  const server = createServer((req, res) => middleware(req, res, () => { res.writeHead(404); res.end(); })); servers.push(server);
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address(); if (!address || typeof address === 'string') throw new Error();
  const origin = `http://127.0.0.1:${address.port}`;
  return (body: unknown, headers = {}) => fetch(origin + '/api/guide/view', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
}
describe('panorama API', () => {
  it('has a server-validated tour for each of the five places', () => {
    for (const place of places) {
      expect(place.tours.length).toBeGreaterThan(0);
      for (const entry of place.tours) expect(validatePanoramaInput({ ...input, placeId: place.id, tourUrl: entry.url }).tourName).toBeTruthy();
    }
  });
  it('never allows arbitrary URLs, images by URL, MIME spoofing or invented place/tour pairs', () => {
    for (const change of [{ tourUrl: 'https://localhost/private' }, { placeId: 'semey' }, { image: 'https://example.org/file.jpg' }, { image: 'data:image/svg+xml;base64,PHN2Zz4=' }, { image: 'data:image/jpeg;base64,YWJjZA==' }, { image: image + 'a'.repeat(1_200_000) }]) expect(() => validatePanoramaInput({ ...input, ...change })).toThrow();
  });
  it('makes the missing-frame limit explicit and treats image text as untrusted', () => {
    expect(panoramaInstructions('Museum', false)).toContain('CANNOT SEE');
    expect(panoramaInstructions('Museum', true)).toContain('single user-selected');
    expect(panoramaInstructions('Museum', true)).toContain('never instructions');
  });
  it('sends a bounded multimodal request, without saving images or trusting client model/context', async () => {
    const fetcher = vi.fn(async () => Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: 'На кадре видна лестница. Точное название экспоната по этому виду определить нельзя.' }] }] }));
    const post = await serve({ apiKey: 'test-key', fetcher: fetcher as typeof fetch });
    const response = await post({ ...input, image, model: 'other', context: 'UNTRUSTED_CONTEXT' });
    expect(response.status).toBe(200);
    const [url, request] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.openai.com/v1/responses');
    const body = JSON.parse(request.body as string);
    expect(body.store).toBe(false); expect(body.model).toBe('gpt-5.4-mini');
    expect(body.input[0].content).toEqual([{ type: 'input_text', text: input.question }, { type: 'input_image', image_url: image, detail: 'high' }]);
    expect(body.instructions).not.toContain('UNTRUSTED_CONTEXT');
    expect(JSON.stringify(await response.json())).not.toContain(image);
  });
  it('rejects invalid, cross-origin, oversize and rate-limited requests before a paid call', async () => {
    const fetcher = vi.fn(); const post = await serve({ apiKey: 'test', fetcher, rateLimit: 0 });
    expect((await post({ ...input, image: 'invalid' })).status).toBe(400);
    expect((await post(input, { Origin: 'https://untrusted.test' })).status).toBe(403);
    expect((await post({ ...input, image: 'x'.repeat(1_200_001) })).status).toBe(413);
    expect((await post({ ...input, image })).status).toBe(429);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('returns an explicit failure when the real provider is unavailable', async () => {
    const post = await serve({});
    const response = await post({ ...input, image }); expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: { code: 'not_configured' } });
  });
  it('does not present a fabricated footnote as a verified visual source', async () => {
    const fetcher = vi.fn(async () => Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: 'На фотографии лестница. [1]\n[1] invented-source' }] }] }));
    const post = await serve({ apiKey: 'test', fetcher: fetcher as typeof fetch });
    const response = await post({ ...input, image });
    expect(response.status).toBe(502); expect(await response.json()).toEqual({ error: { code: 'invalid_citations' } });
  });
});
