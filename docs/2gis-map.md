# 2GIS map / #/map

The historical atlas uses the official `@2gis/mapgl` loader and SDK 1.79.0.
The existing place list, search, filters, selected story, source links and
population chart remain the page shell. The home Three.js region is separate.

## Configuration

Put `VITE_2GIS_API_KEY=your-browser-map-key` in the ignored `.env.local`.
The key needs Map Tiles / MapGL service access. Restart the dev server or
rebuild after changing it. This is a client-side map key: the SDK sends it
to 2GIS. Keep server-only guide credentials in `.env.server.local`.

## Behavior

- Five HTML markers use the existing place coordinates. The Abai outline
  uses the existing OSM GeoJSON. Native 2GIS attribution remains visible.
- Selecting a place focuses its detailed map, including when selecting
  the currently active row again. The overview button fits the region.
- The terrain switch uses the SDK's `terrainEnabled` style variable.
- Search and category filters also control marker visibility. Map language
  follows KK/RU/EN through `setLanguage`.
- Zoom, north reset and the complete place list support keyboard use.
  A focused map canvas supports arrow keys, +/− and Home.
- The SDK loader shares a request across concurrent mounts and allows
  retry after errors/timeouts. Failed SDK, authorization or WebGL loading
  leaves the story list usable and offers retry.
- Controls become ready on `styleload`; they do not wait for every tile
  and label to finish loading. `idle` also refreshes marker positioning.
- React unmount/retry aborts boundary loading and destroys markers,
  polygon objects, observers and the map.

Official references:
[getting started](https://docs.2gis.com/en/mapgl/start/first-steps),
[SDK classes](https://docs.2gis.com/en/mapgl/reference/class),
[terrain](https://docs.2gis.com/en/mapgl/map-style/immersive/terrain).

Local verification artifacts are in `.research/2gis-integration/`.
