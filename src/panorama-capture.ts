// Only cropped, user-approved tab pixels may reach the image endpoint.
type CropTargetAPI = { fromElement(element: Element): Promise<unknown> };
type CropTrack = MediaStreamTrack & { cropTo?: (target: unknown) => Promise<void> };
export interface PanoramaCapture { stream: MediaStream; frame(): string; sample(): Uint8ClampedArray; stop(): void }

export async function cropPanoramaStream(stream: MediaStream, target: unknown, current: () => boolean) {
  try {
    if (!current()) throw new Error('capture_cancelled');
    const track = stream.getVideoTracks()[0] as CropTrack | undefined;
    if (!track?.cropTo || track.getSettings().displaySurface !== 'browser') throw new Error('capture_unsupported');
    // Rejects other tabs/windows: Region Capture only crops self-capture.
    await track.cropTo(target);
    if (!current()) throw new Error('capture_cancelled');
    return track;
  } catch (error) { stream.getTracks().forEach(track => track.stop()); throw error; }
}

export async function startPanoramaCapture(element: Element, current: () => boolean): Promise<PanoramaCapture> {
  const api = (window as Window & { CropTarget?: CropTargetAPI }).CropTarget;
  if (!api || !navigator.mediaDevices?.getDisplayMedia) throw new Error('capture_unsupported');
  const target = await api.fromElement(element);
  if (!current()) throw new Error('capture_cancelled');
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { frameRate: { ideal: 5, max: 8 } }, audio: false,
    preferCurrentTab: true, selfBrowserSurface: 'include', surfaceSwitching: 'exclude', monitorTypeSurfaces: 'exclude',
  } as DisplayMediaStreamOptions);
  const video = document.createElement('video');
  let stopped = false;
  const stop = () => { stopped = true; stream.getTracks().forEach(track => track.stop()); video.pause(); video.srcObject = null; };
  try {
    await cropPanoramaStream(stream, target, current);
    video.muted = true; video.playsInline = true; video.srcObject = stream;
    await video.play();
    if (!current()) throw new Error('capture_cancelled');
    const canvas = document.createElement('canvas');
    const sampleCanvas = document.createElement('canvas'); sampleCanvas.width = 32; sampleCanvas.height = 18;
    function ready() {
      if (stopped || !current() || document.hidden || document.fullscreenElement || video.readyState < 2 || !video.videoWidth || stream.getVideoTracks()[0]?.readyState !== 'live') throw new Error('capture_not_ready');
      const rect = element.getBoundingClientRect();
      if (rect.top < 0 || rect.left < 0 || rect.bottom > window.innerHeight + 1 || rect.right > window.innerWidth + 1) throw new Error('capture_not_visible');
    }
    return { stream, stop,
      frame() {
        ready(); const scale = Math.min(1, 1280 / video.videoWidth, 960 / video.videoHeight);
        canvas.width = Math.round(video.videoWidth * scale); canvas.height = Math.round(video.videoHeight * scale);
        canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', .78);
      },
      sample() { ready(); const context = sampleCanvas.getContext('2d', { willReadFrequently: true })!; context.drawImage(video, 0, 0, 32, 18); return context.getImageData(0, 0, 32, 18).data; },
    };
  } catch (error) { stop(); throw error; }
}

export async function preparePanoramaImage(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8_000_000) throw new Error('invalid_image');
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width < 64 || bitmap.height < 64 || bitmap.width * bitmap.height > 40_000_000) throw new Error('invalid_image');
    const scale = Math.min(1, 1280 / bitmap.width, 960 / bitmap.height);
    const canvas = document.createElement('canvas'); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', .78);
  } finally { bitmap.close(); }
}

function difference(a: Uint8ClampedArray, b: Uint8ClampedArray) {
  if (a.length !== b.length) return 255;
  let total = 0;
  for (let i = 0; i < a.length; i++) if (i % 4 !== 3) total += Math.abs(a[i] - b[i]);
  return total / (a.length * .75);
}
// Wait for a settled new view; never send a request on every mouse movement.
export class StableViewGate {
  private previous?: Uint8ClampedArray;
  private sent?: Uint8ClampedArray;
  private lastSent = -Infinity;
  count = 0;
  observe(pixels: Uint8ClampedArray, now: number) {
    const stable = !!this.previous && difference(this.previous, pixels) < 3;
    this.previous = pixels.slice();
    if (!stable || this.count >= 10 || now - this.lastSent < 20_000 || (this.sent && difference(this.sent, pixels) < 12)) return false;
    this.sent = pixels.slice(); this.lastSent = now; this.count++; return true;
  }
}
