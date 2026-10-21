import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const { loadSdk } = vi.hoisted(() => ({ loadSdk: vi.fn() }));
vi.mock('@2gis/mapgl', () => ({ load: loadSdk }));

beforeEach(() => { vi.resetModules(); loadSdk.mockReset(); vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

it('shares a single SDK load across concurrent map mounts', async () => {
  const sdk = { Map: 'sdk' };
  loadSdk.mockResolvedValue(sdk);
  const { loadMapgl } = await import('./mapgl-loader');
  const first = loadMapgl(), second = loadMapgl();
  expect(first).toBe(second);
  expect(await first).toBe(sdk);
  expect(loadSdk).toHaveBeenCalledOnce();
  expect(loadSdk).toHaveBeenCalledWith('https://mapgl.2gis.com/api/js/v1.79.0');
});

it('allows retry after a failed SDK request', async () => {
  loadSdk.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce({ Map: 'sdk' });
  const { loadMapgl } = await import('./mapgl-loader');
  await expect(loadMapgl()).rejects.toThrow('network');
  await expect(loadMapgl()).resolves.toEqual({ Map: 'sdk' });
  expect(loadSdk).toHaveBeenCalledTimes(2);
});

it('bounds a stalled SDK request and lets the next attempt recover', async () => {
  loadSdk.mockReturnValueOnce(new Promise(() => {})).mockResolvedValueOnce({ Map: 'sdk' });
  const { loadMapgl } = await import('./mapgl-loader');
  const outcome = expect(loadMapgl()).rejects.toThrow('timed out');
  await vi.advanceTimersByTimeAsync(15000);
  await outcome;
  await expect(loadMapgl()).resolves.toEqual({ Map: 'sdk' });
  expect(loadSdk).toHaveBeenCalledTimes(2);
});
