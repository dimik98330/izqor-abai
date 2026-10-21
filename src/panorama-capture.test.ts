import { describe, expect, it, vi } from 'vitest';
import { cropPanoramaStream, StableViewGate } from './panorama-capture';

function stream(cropTo?: (target: unknown) => Promise<void>, displaySurface = 'browser') {
  const track = { cropTo, stop: vi.fn(), getSettings: () => ({ displaySurface }) };
  return { track, media: { getVideoTracks: () => [track], getTracks: () => [track] } as unknown as MediaStream };
}
describe('panorama capture privacy boundary', () => {
  it('releases an uncroppable track instead of falling back to full-screen pixels', async () => {
    const { track, media } = stream();
    await expect(cropPanoramaStream(media, {}, () => true)).rejects.toThrow('capture_unsupported');
    expect(track.stop).toHaveBeenCalledOnce();
  });
  it('rejects window/monitor selection and stops it before crop or frame creation', async () => {
    const crop = vi.fn(), { track, media } = stream(crop, 'monitor');
    await expect(cropPanoramaStream(media, {}, () => true)).rejects.toThrow();
    expect(crop).not.toHaveBeenCalled(); expect(track.stop).toHaveBeenCalledOnce();
  });
  it('releases a different tab when the browser rejects Region Capture', async () => {
    const { track, media } = stream(async () => { throw new Error('different tab'); });
    await expect(cropPanoramaStream(media, {}, () => true)).rejects.toThrow('different tab');
    expect(track.stop).toHaveBeenCalledOnce();
  });
  it('releases a stream whose permission resolves after the dialog closes', async () => {
    const { track, media } = stream(vi.fn());
    await expect(cropPanoramaStream(media, {}, () => false)).rejects.toThrow('capture_cancelled');
    expect(track.stop).toHaveBeenCalledOnce(); expect(track.cropTo).not.toHaveBeenCalled();
  });
  it('also handles closing while cropTo is pending', async () => {
    let current = true;
    const { track, media } = stream(async () => { current = false; });
    await expect(cropPanoramaStream(media, {}, () => current)).rejects.toThrow('capture_cancelled');
    expect(track.stop).toHaveBeenCalledOnce();
  });
});
const pixels = (value: number) => new Uint8ClampedArray([value, value, value, 255, value, value, value, 255]);
describe('automatic panorama hints', () => {
  it('waits for motion to settle and ignores repeated/small changes', () => {
    const gate = new StableViewGate();
    expect(gate.observe(pixels(10), 0)).toBe(false);
    expect(gate.observe(pixels(90), 2000)).toBe(false);
    expect(gate.observe(pixels(90), 4000)).toBe(true);
    expect(gate.observe(pixels(91), 26000)).toBe(false);
    expect(gate.observe(pixels(130), 28000)).toBe(false);
    expect(gate.observe(pixels(130), 30000)).toBe(true);
  });
  it('enforces a cooldown and a finite automatic session budget', () => {
    const gate = new StableViewGate();
    gate.observe(pixels(0), 0); expect(gate.observe(pixels(0), 2000)).toBe(true);
    gate.observe(pixels(60), 4000); expect(gate.observe(pixels(60), 6000)).toBe(false);
    expect(gate.observe(pixels(60), 22000)).toBe(true);
    for (let i = 2; i < 15; i++) { const frame = pixels(i % 2 ? 60 : 0); gate.observe(frame, i * 24000); gate.observe(frame, i * 24000 + 2000); }
    expect(gate.count).toBe(10);
  });
});
