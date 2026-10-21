# Immersive homepage story entrance

Approved on 21 October 2026: the third displayed lower-page concept, followed by
the revised mock replacing the abstract Borili subtitle with
`Дом-музей Мухтара Ауэзова` / `Мұхтар Әуезовтің үй-музейі` /
`Mukhtar Auezov’s house museum`.

## Visual contract

- Source: `.research/immersive-story-2026-10-21/reference.png`, 1536 × 1024.
- Keep the existing landscape entrance, original geographic sculpture and open
  place selector. Per the later correction, the new entrance below is permanently
  featured Borili, independent of the map selection. Its illustration, caption,
  story action and guide context all remain Borili.
- No dated rail, historical dots, or extra epoch navigation below the hero.
  The existing header still opens the timeline page.
- A full-width photographic illustration, dark natural foliage behind left-aligned
  text, large Literata title, a plain subtitle and short description.
- One brass `Открыть историю` action and a quiet `Спросить гида` action. Both use
  Borili; the guide dialog opens with Borili selected.
- Warm ivory text, readable light-weight Geologica, forest-green footer #082f27.
  Local font files and existing Lucide icons are reused. No new dependencies.
- Desktop copy gutter 104px at 1440px. The scene is 74svh within 640–880px;
  portrait layouts allow content to grow, retain readable shading and 48px targets.
- No companion overlay on the image caption/footer while the footer is visible;
  the scene's guide button remains available.

## Image quality and provenance

The live background is `public/media/borili-scene-hero.webp`, 1787 × 880,
637,048 bytes. It is a generated illustration derived from the approved image
composition and the museum's original photograph. The building/tree composition
was matched to the selected mock; vegetation and fine details are synthesized.
The caption explicitly identifies the illustration and links to the original.
It is not presented as a documentary photograph or a 4K image.

The factual place article retains `public/media/borili.jpg`. Source PNG and the
complete built-in ImageGen prompts are archived in
`.research/immersive-story-2026-10-21/scene-source.png` and
`.research/immersive-story-2026-10-21/generation-prompts.md`.
WebP conversion preserved dimensions/composition; no image assets were bundled
from the low-resolution portal candidate. Existing publisher reuse limits remain
recorded in `MEDIA-CREDITS.md`.

## Verification

Desktop 1440 × 960 and mobile 390 × 844 were browser-verified. The story opens
`#/place/borili`; the guide opens with Borili selected. RU/KK/EN copy fits with no
horizontal document overflow. Final reload logged no browser errors. TypeScript
and the production build passed. Physical phone hardware was not tested.

The final full and focused comparisons are `comparison-final.png` and
`comparison-copy-final.png` in the evidence directory. The old header and steppe
slice deliberately retain their existing appearance instead of the mock's
slightly different header/cue, per the explicit first-screen preservation request.

The first comparison found an overly wide description and heavy small text.
The final pass narrows the copy and uses the existing variable font's 300 weight.
The initial generated photo's entrance placement was corrected using the approved
photo crop before the final comparison. No actionable P0/P1/P2 issues remain in
the requested lower story entrance. Minor font/raster differences from a generated
mock remain possible; pixel-perfect identity is not claimed.

final result: passed
