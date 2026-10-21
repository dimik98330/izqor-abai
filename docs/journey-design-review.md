# Journey design review — 21 October 2026

## What this pass did

Follow-up: the user's actual Chrome at 2560px had the saved contrast option
enabled. Its old hero override removed the warm layers and covered the scene
with a 91%-to-60% opaque teal gradient. Removed that override, added a local
reading-area shade, and aligned the bloom to the content shell on wide screens.
The preference remains enabled. Before/after captures from the user's Chrome
and the focused production checks are in
`.research/sunlight-contrast-2026-10-21/`.
Production checks passed at 2560/1440/390px with contrast enabled and at 2560px
with normal contrast, including preference persistence after reload. No overflow
or JavaScript errors. Sampled photographed backgrounds beneath text lines gave
minimum heading contrast 3.64:1 and paragraph contrast 10.24:1 across those
contrast-mode viewports. The production build passed.

Later user correction on 21 October: strengthened directional golden light at
the left horizon, reduced the cold veil, brightened headline/intro and CTA, and
kept mobile reading contrast with a separate scrim. A new production build and
1440/390px browser pass succeeded; primary-button contrast is now 7.9:1.
Updated images and incremental output are in `.research/sunlight-2026-10-21/`.

The page was refined against one generated composition, rather than a collection
of unrelated library examples. The agreed brand, left headline/right live map,
five places, camera bearing and RU/KK/EN stayed fixed.

- Before: `.research/journey-design-2026-10-21/before-1440.png`.
- Single reference: `.research/journey-design-2026-10-21/reference.png`.
- Exact prompt: `reference-prompt.txt` in the same folder.
- Browser implementation: `after-1440.png`, `editorial-1440.png`, `memory-1440.png`.
- Comparison with a Before/After control: `comparison.html`.

The comp's museum caption and invented footer year/links were not treated as
product facts. The actual photograph is the Alash Arystary museum in Semey,
credited to Erden Karsybekov under CC BY-SA 4.0; the existing source record is
linked in the page.

## Independent assessment and visual feedback

Two separate read-only assessments inspected the initial page: one visual,
one usability-focused. Their repeated findings were tiny useful labels,
excessive capsules, a fragmented atlas column, accidental mobile wrapping and
the generic rounded callout under the hero.

Implementation and screenshot comparison then produced concrete corrections:
- Plain navigation, a brass active line, and one 6px-corner brass primary action.
- Useful place/action labels enlarged, selected story presented as an open row.
- Intentional two-column place selection on mobile, long final item full width.
- A real editorial photograph and text replace the oversized rounded callout.
- A CSS specificity conflict overriding memory-section padding was found in the
  screenshot and fixed; computed top padding is now 55px at 1440px.
- The editorial title's measure was shortened to match the reference's hierarchy.
- The photographic framing and scrim were adjusted to retain warm light on the left.
- The lower scroll action moves keyboard focus to the next heading.

A mechanical Impeccable detector pass ran once after implementation. It returned
exit 0 and an empty findings array; `impeccable-detector.json` preserves stdout.
This is mechanical evidence, not a proof of design quality.

## Runtime validation

Production origin: http://127.0.0.1:4173/

- TypeScript and production build pass.
- 360, 390, 768, 1000, 1024, 1280, 1440, 2560 CSS px: no horizontal overflow,
  one live map in the first screen, all five markers and no broken local images.
- Checked solid-surface contrast: primary action 7.9:1 after the lighting correction; editorial text on paper
  5.4:1. Photographic backgrounds were inspected visually, not assigned a fake
  uniform contrast measurement.
- RU/KK/EN, larger text/contrast, reduced motion and no-WebGL fallback pass.
- An additional reflow context used a 720px viewport with deviceScaleFactor 2.
- Zoom in/out, keyboard rotation, reset, all five place choices with stable
  camera/scroll, opening stories, guide/settings/introduction, mobile navigation
  and Escape pass.
- Hover preserves button dimensions; the continuation action transfers focus.
- No uncaught JavaScript errors in the browser run.

Exact browser output: `browser-report.json` beside the comparison.
The live page uses the actual Three.js geometry rather than the comp's
illustrative raster map.

## Practical limits

Headless Chrome used SwiftShader; these are functional and visual checks, not
physical-phone or GPU performance measurements. Some full-page captures omit the
WebGL layer while the ordinary viewport before and after remains correct.
The comparison therefore uses independently captured first-screen and editorial
regions as its visual evidence. No rendering flags were changed to disguise
this capture behavior.

This pass adds no framework dependencies, sends no questions to the paid guide
API, and does not publish a public deployment. Other in-progress project changes
were preserved; the scoped pre-edit sources are in `before-source/`.

Questions skipped: the user explicitly requested implementation, and the prior
conversation already fixes the page, brand, camera bearing, map placement and
content. The completed local result is available for review in comparison.html.
