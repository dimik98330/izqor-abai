# Timeline lower-section QA — 21 October 2026

Target: `output/timeline-bottom-refinement-2026-10-21/bottom-concept.png`, approved by the user. The later instruction explicitly rejects the repeated tree photograph, so the implemented neutral dark surface intentionally removes that artwork. Two replacement photographic directions are a separate selection step.

Built page: http://127.0.0.1:4173/#/timeline/khanate

## Evidence and comparison

- Source mock: 1536 × 1024. Browser CSS viewport: 1536 × 1024, density 1, actual scrollable content width 1521.
- Full built screenshot: `output/timeline-bottom-refinement-2026-10-21/implementation/page-desktop-built.png`.
- Lower crop: `implementation/lower-built.png` in that folder, document y=561, including 270px of hero context and the complete new lower section.
- Equal-size comparison: `implementation/lower-comparison-built.png`, target left, actual built page right. Both comparison regions are 1521 × 992, cropped without rescaling; the unused 15px right edge/native scrollbar margin and bottom blank area of the generated target are excluded.
- Phone: `implementation/phone-closed.png`; tablet English: `implementation/tablet-english.png`.
- Examined full composition and the readable labels, text hierarchy and primary/secondary actions. The upper hero geometry is inherited from the already accepted first-page implementation and was not redesigned.

## Fidelity surfaces

- Typography: local Literata display headings and Geologica controls. Large lower-section heading, readable short history, primary reading button, smaller helper, secondary guide and prominent next chapter.
- Layout: a coherent dark lower surface; reading action before next-chapter navigation; guide in a separate column above 900px, stacked below that width. The old small disclosure utility row and empty cream bands are gone.
- Color: ivory reading text, brass reading CTA and outline guide/next actions on deep teal. Extended reading opens an explicit warm-paper reading surface for long-form comfort.
- Images: original map and attribution preserved. The repeated landscape image element is removed from the chapter hero; no replacement photograph is silently selected.
- Copy: actual short history retained; full original prose, facts, culture, source links and narration text remain available. RU/KK/EN labels added for read, collapse and guide explanation.
- Icons: existing Lucide book, messages, collapse chevron and arrows, no new dependency.
- States: read/collapse, expanded source navigation, keyboard focus return, guide dialog, chapter transitions, mobile/large-text presentation.

## Verification

- `npm run check`: passed before the production build.
- `npm run build`: passed.
- `node node_modules/vitest/vitest.mjs run --exclude 'output/**'`: 9 suites, 68 tests passed. Archive backups are excluded, as in the preceding timeline QA.
- Impeccable detector: [].
- Component diff whitespace check: no whitespace findings.
- Reading opens the full section and focuses it; collapsing returns focus to the main reading action.
- Language changes retain the open reading mode.
- The sources action reveals the full story and focuses `timeline-sources`.
- Next chapter opens Abai; previous restores the khanate.
- Inline guide opens and closes the existing guide dialog; no AI request was sent.
- Mobile KK with large text: reading remains open and horizontal document overflow is absent.
- 320px phone: clientWidth = scrollWidth = 305.
- 768px English: no horizontal document overflow.
- Fresh built page: no browser errors/warnings; read/collapse also exercised on the built origin.

## Remaining choices and limits

The final hero photograph is awaiting the user's choice between two visual proposals. This does not block the approved lower-section layout, which is already implemented and usable. Reusing the previous tree and repeating imagery behind reading are explicitly rejected. Small differences in font letterforms, footer's retained existing links and original source-map pixels remain from the generated reference. Audible system speech was not retested by this layout-only change.

final result: passed

