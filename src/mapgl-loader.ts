import { load } from '@2gis/mapgl';

type MapglSdk = Awaited<ReturnType<typeof load>>;
let pending: Promise<MapglSdk> | undefined;

// Share one SDK request between mounts (including React StrictMode).
// Rejected or stalled requests may be retried by the map's recovery button.
export function loadMapgl(): Promise<MapglSdk> {
  if (!pending) {
    const request = new Promise<MapglSdk>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('2GIS SDK loading timed out')), 15000);
      Promise.resolve().then(() => load('https://mapgl.2gis.com/api/js/v1.79.0')).then(
        sdk => { clearTimeout(timer); resolve(sdk); },
        error => { clearTimeout(timer); reject(error); },
      );
    });
    pending = request.catch(error => { pending = undefined; throw error; });
  }
  return pending;
}
