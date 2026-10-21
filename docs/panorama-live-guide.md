# Panorama guide

Developed in `codex/panorama-live-guide`, then merged into `main` and released on 2026-10-21 at https://izqor-abai.vercel.app. Release code: `fc135bf`. Unfinished local story-layout edits were preserved separately and were not included in this deployment.

Vercel deployment: `dpl_G9zCBYjc3wrFWrFZ7heYuJCpwaQX` (`izqor-abai-nzhpb5p2b-12212.vercel.app`). Previous deployment retained for rollback: `dpl_HwVJe4Fb4rFtA5v2NUnY5NDt9kR6`.

## Behavior

- The 360° dialog has a companion sidebar, conversation, source links and tour selector in RU / KK / EN.
- All five place pages now offer a panorama: the five existing museum tours plus the cave exterior and the Kozy Korpesh — Bayan Sulu tour.
- Without an image, the guide knows the selected place and tour but is explicitly instructed not to claim visual access.
- “What am I looking at?” analyzes a cropped frame of the current panorama after browser permission. Desktop Chrome/Edge with Region Capture is required. The user must choose the current IZQOR tab.
- Screenshot attachment is a fallback on other browsers. Images are resized locally to at most 1280 × 960 and converted to JPEG; uploads accept JPG, PNG and WebP up to 8 MB.
- Automatic hints are off initially. They wait for the view to settle, ignore small/repeated changes, enforce a 20-second cooldown and stop after ten frames. Errors stop automatic hints. Manual questions remain available.

## Boundaries

The third-party museum/Yandex viewers do not expose camera state to the parent application. The implementation does not bypass cross-origin protections or pretend to know yaw/pitch. It uses the browser's Region Capture API, cropping to the panorama element before any frame is drawn. Window/monitor selection, unsupported cropping and a different tab fail closed. No whole-screen capture fallback is implemented.

Streams stop on closing the dialog, changing tour/language or disconnecting. Permission/cropping that resolves after the session closes also stops immediately. Requests are aborted on session removal. Hidden tabs, an out-of-viewport panorama and fullscreen mode do not produce automatic frames. Underlying iframe navigation stays within the same tour; the next submitted image is the authority for the current view.

Frames go to OpenAI through the existing server-only credential and fixed Responses API URL. `store: false` is set. The application does not persist frames; up to ten recent conversation thumbnails remain in component memory until closing or changing the session. Earlier images are never sent again as chat history. Provider processing is disclosed in the panel; `store: false` is not a claim about the provider's separate abuse-monitoring retention policies.

`POST /api/guide/view` validates the exact place/tour pair against the server catalog. It only accepts bounded JPEG data URLs (not arbitrary image URLs), rejects cross-origin requests and shares the middleware's concurrency/rate limits. Responses with unverified numbered footnotes fail instead of rendering fabricated references. These are per-instance limits, not distributed deployment-wide quotas.

## Source research — 2026-10-21

- Cave: [Yandex Maps](https://yandex.kz/maps/ru/org/qongyr_aulie_unggiri/203456034898/panorama/). Verified an interactive exterior panorama and movement between several points near 78.5344, 49.1049. Attribution shown by Yandex: Konstantin Budaev, 15 September 2026. The official sharing UI supplied the iframe widget URL. The embed was rendered in the local application. **An interior/underground-lake panorama was not verified.** The UI and reference answers explicitly say exterior.
- [3D Maps cave entry](https://3d-maps.kz/ru_place_595-peshchera-konyr-aulie-v-abayskom-rayone) links to `/files/595/tour/index.html`, which returned 404 during this check.
- [Kieli cave entry](https://kieli.kz/kz/place/aqtas-tauyndagy-qonyr-aulie-ungiri) has a 360 button, but the opened embed was an ordinary Google map, not a verified interior panorama.
- Kozy Korpesh — Bayan Sulu: linked from [Ruhani Atalemi media](https://www.ruhaniatalemi.kz/ru/media). [Working 360 tour](https://www.ruhaniatalemi.kz/static/3d/2710/3e8/98f13708210194c475687be6106a3b84/), visually verified directly and embedded in the local app.
- [Chrome Region Capture documentation](https://developer.chrome.com/docs/web-platform/region-capture) describes the cropped self-capture mechanism.

## Verification

- TypeScript check and production build passed.
- Full Vitest suite: 90 passing tests, including HTTP validation, capture cleanup after stale permission, rejected monitor/different-tab crops, motion settling, cooldown and session budget.
- Real provider request from the sidebar: place question answered with clickable sources.
- Real image request through the browser's attachment control: the guide described the supplied cave-interior photograph (stone walls, wooden stairs/railings, lighting) and did not claim to see the underground lake. Verified canonical source link after tightening citation instructions.
- 390 px layout inspected: no horizontal overflow; composer reachable by scrolling. Desktop dialog and third-party embeds visually inspected.
- Vercel production build passed. The public origin returns configured status, validates the new `/api/guide/view` endpoint and answers a real question from its browser UI. Text and image analysis were also checked against the deployed function before promotion.
- Real Chrome tab capture was subsequently observed on the public origin after the native picker was approved: a 1280 × 660 cropped panorama frame reached the guide. Its answer matched the visible boardwalk, lamp and roofed building outside the cave. The sidebar was not included in the captured frame.
- Automatic hints were enabled on the public site and produced a real image-based answer after the view settled. Automated tests separately cover the cooldown, ten-frame budget and release of rejected/stale capture streams. Browser sharing still requires the visitor to approve the current tab each session; other browsers can use screenshot attachment.

## Run locally

From this worktree, with the existing ignored `.env.server.local` configuration:

```powershell
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5181 --strictPort
```

Open `http://127.0.0.1:5181/#/place/konyr` and choose “Войти в панораму”. Main development on port 5173 remains separate.
