# Settings: Night Atlas visual QA

Date: 2026-10-21. Scope: the selected second Canva settings concept.

final result: passed

## Visual truth and normalization

- Source: `.research/settings-canva/02-night-atlas.webp` (1088 × 1456).
- Selected Canva design: https://www.canva.com/design/DAHYlDmjkG4/lONqwdvVG6Xj7NfnvW9cMQ/edit.
- Source dialog crop: `(59, 43, 1011, 1413)`, normalized to 600 × 863 pixels.
- Built implementation: http://127.0.0.1:4173/#/sources.
- Viewport: 1440 × 1000 CSS pixels; device scale factor 1.
- Measured dialog: 600 × 863.25 CSS pixels; raster capture: 600 × 864.
- State: RU, normal text, high contrast and reduced motion enabled, music off, volume zero, five explored places. The fixture runs in an isolated browser context and does not replace the user's progress.
- Full comparison: `.research/settings-night/comparison-final.png`.
- Focused control comparison: `.research/settings-night/comparison-controls.png`.
- Built screenshots: `.research/settings-night/production.png`, `production-dialog.png`.
- In-app browser evidence with the user's actual saved settings: `.research/settings-night/in-app-production.png`.

## Findings and fixes

- [Resolved P2] The first implementation was 918 pixels tall at a 600-pixel width. Section spacing, rows, heading metrics and footer spacing were corrected; the built dialog now matches the source's normalized height to less than one CSS pixel.
- [Resolved P2] The initial font pairing was too wide and heavy. The heading now uses 41-pixel Times New Roman, with Arial for native control text, matched visually against the raster reference on Windows.
- [Resolved P2] Generic accessibility icons and the existing guide portrait differed from the selected concept. Nine small WebP assets were extracted directly from the approved reference: three accessibility icons, dombyra illustration, guide portrait, on/off switch artwork, play control and completed checkpoint.
- [Resolved P2] The previous stacked bordered cards, large progress numeral and plain progress bar have been replaced with open rows, thin separators, the circular brass player and five connected completion markers.
- No unresolved P0/P1/P2 findings remain in the tested states.

## Required fidelity surfaces

- **Typography:** heading shape, width, alignment and subtitle hierarchy compared together with the reference; readable Russian, Kazakh and English text retained. The implementation uses native text, not a screenshot of the whole interface.
- **Spacing:** full-view and control crops compared side by side after each correction. The 600-pixel dialog width and overall height match; small-screen content scrolls within the dialog while the close control remains available.
- **Colors:** dark teal canvas, warm title, brass controls, muted copy and fine dividers use scoped settings tokens. High-contrast mode retains readable colors rather than inheriting the site's light panel palette.
- **Images:** reference-derived assets are deployed under `public/media/settings-night/`; the built page loads them without errors. Original guide and brand files elsewhere in the project are preserved.
- **Copy:** all original settings, translated labels, audio credit, reset confirmation and real progress values remain. The five-completed state is only a comparison fixture.

## Functional and responsive evidence

- `npm run build`: passed, including TypeScript.
- `npm test`: 9 files, 44 tests passed.
- `.research/settings-night/verify.mjs`: passed five browser cases, with no page errors.
- Checked: three native switches; keyboard-operated volume slider; persistence after reload; music play/pause; reduced motion; cancel reset; reset explored/saved places; Escape close; guide introduction.
- Viewports: 1440 × 1000, 390 × 844 and 320 × 740. Large-text KK and EN were checked at 390 × 844. No horizontal dialog overflow; footer remains reachable by scrolling.
- Final built-origin capture: `.research/settings-night/capture-production.mjs`; `production-verification.json` reports no missing settings assets or page errors.
- Controls remain semantic inputs/buttons with visible keyboard focus. Slider, switches, player, reset and close retain at least a 44-pixel interaction dimension.

## Follow-up polish (P3)

The source is an AI-generated raster, so browser font rasterization and a few icon-edge/line details are not literally pixel-identical. Native text remains selectable and accessible. The full canvas uses a solid dark-teal surface rather than baking the reference's subtle raster shading into the page. Other platforms may render the system font edges differently.

## Scope and recovery

Application source changes: `src/SettingsPanel.tsx`, `src/settings-panel.module.css`; no new dependencies. Original source copies are in `.research/settings-night/before/`, and the reviewed component diff is in `.research/settings-night/implementation.diff`.

---

# Journey: selected paper place index

Date: 2026-10-21. Scope: the user's selected second displayed place-selector mock.

final result: passed

Full comparison history, all five required fidelity surfaces, screenshots and
runtime evidence are recorded in `.research/place-index-2026-10-21/design-qa.md`.
Source: `.research/place-index-2026-10-21/selected-reference.png`.
Combined post-fix evidence: `.research/place-index-2026-10-21/comparison-final.png`.
Browser captures: `actual-1440.png`, `actual-390.png` and `hero-1440.png` in that
same folder. Semey/RU was used for matched comparison. Initial spacing, photo
crop and mobile whitespace findings were corrected before the final review.

Geologica/Literata, opaque paper/ink/brass colors, the real place photographs
and catalog text were checked. Production build and browser checks passed;
no remaining actionable P0/P1/P2 findings. Physical phone hardware was not tested.
Application changes are limited to `src/HomeJourney.tsx`, `src/home-journey.css`
with corresponding verification and design-contract updates.

## 21 October 2026 — landscape entrance and open place selector

Current user direction supersedes the slate atlas hero: keep the original landscape,
heading and geographic sculpture; keep the new continuation/footer below. Remove the
light place-selector panel and integrate its choices directly into the landscape.

Source visual: `.research/place-selector-clean-2026-10-21/reference.png` (1440x960).
Desktop implementation: `.research/place-selector-clean-2026-10-21/desktop-1440.png`
(1440x960; CSS viewport 1440x960, density 1, RU, Zhidebay selected).
Full comparison: `.research/place-selector-clean-2026-10-21/comparison.png`.
Focused comparison: `.research/place-selector-clean-2026-10-21/comparison-detail.png`.
Mobile evidence: `mobile-390.png` and `mobile-long-title.png` in the same directory;
CSS viewport 390x844. Screenshots from the IAB screenshot API exclude its scrollbar.

The original HomeJourney.tsx and RegionScene.tsx were restored byte-for-byte against
`.research/living-atlas-2026-10-21/before/`. The later selector change is scoped to
home-journey.css: transparent background, wrapping horizontal choices, gold selected
underline, 72x80 thumbnail, open title/era/action row. The header, landscape, real 3D
geometry and lower continuation are preserved. Recording remains accessible from the
footer. The era links open the matching timeline chapter.

Compared typography, alignment/spacing, transparent and gold colors, real photograph
quality and the full Kazakh place names. The panel is gone without introducing a new
green container. No actionable P0/P1/P2 differences within this requested change.
Original map tools omitted before this change remain omitted; the screenshot is a
local selector reference, not an instruction to restore those tools.

Browser checks: Semey selection updates the lower story; the full Kozy Korpesh —
Bayan Sulu title wraps; all five targets are at least 44px high; no document horizontal
overflow at 1440 or 390px. The Constitution link opens #/timeline/constitution and its
selected chapter. Final npm run build passed (build.log in the evidence directory).
Existing HMR messages recorded during file replacement are not a final build failure.
Physical phone hardware and microphone recording were not exercised.

final result: passed


---

# Timeline visual QA — 21 October 2026

Scope: selected concept 1, the existing timeline route. This is the latest timeline QA; other routes keep their own contracts.

Source visual truth: `output/timeline-concepts-2026-10-21/concept-1.png`.
Implementation: `output/timeline-concepts-2026-10-21/implementation-desktop-final.png`.
Built origin: http://127.0.0.1:4173/#/timeline/khanate
State: Russian, first chapter, regular text, details closed, pointer outside all controls, no playing audio or open dialog.

## Capture and comparison

- Reference: 1487 × 1058 pixels.
- Final implementation: 1487 × 1058 pixels, CSS viewport 1487 × 1058, density 1.
- Final capture uses explicit CDP viewport clipping after local fonts and finite entrance animations finish. Earlier native browser screenshots were 1472 × 1047 and are iteration evidence only.
- Windows reserves 15 CSS px for its vertical scrollbar; content width is 1472. The generated design does not model native scrollbars.
- Full comparison: `output/timeline-concepts-2026-10-21/comparison-desktop.png`; source on the left, rendered implementation on the right.
- Focused typography comparison: `output/timeline-concepts-2026-10-21/comparison-chapter-heading.png`, same ordering, unscaled crop (180,330)–(675,805).
- Responsive evidence: `implementation-mobile-final-full.png` (390px viewport), `implementation-mobile-kk-large.png`, `implementation-tablet-en.png`, `implementation-desktop-2560.png` in the same folder.
- Comparison sheets are analytical contact sheets. The original reference and screenshot pixels were not painted over or edited.

## Required fidelity surfaces

1. Fonts/typography: local Literata display headings with explicit variable weight/optical size; Geologica controls and reading. Main heading wraps into the same three lines, with the date, short description and actions in the same hierarchy. Body excerpt follows the selected mock's three-line desktop measure. All three interface languages were switched in the browser. Kazakh large text was visually inspected at 390px.
2. Spacing/layout: light introduction and six-step chronology, full-width dark landscape chapter, source figure at right, light reading/guide row and slim next-chapter navigation. The detailed original article is retained in an accessible disclosure after the selected first-screen composition. Tablet and phone use a single-column chapter.
3. Colors/tokens: deep teal header/hero, warm parchment, brass selected state/CTA, dark reading text. Primary hover changes rgb(228,194,131) to rgb(240,211,148). Native keyboard focus remains visible. Footer text is explicitly darkened for the parchment background.
4. Image quality: existing supplied logo is reused. The map is the original `public/media/timeline/khanate-map.webp`, contained without distorting geography, with visible credit and a modern-map caveat. Its exact map lettering differs from the generated mock because generated map details are not a historical source. The decorative landscape is a separate generated image, not a screenshot used as a webpage.
5. Copy/content: Russian primary copy matches the selected concept, including the introduction, short history, guide and next action. Full historical prose, facts, cultural material, source links, narration text and copy control remain available. No simulated open-data integration or AR claim was introduced.
6. Icons: existing Lucide family; headphones, map pin, search/enlarge, messages, arrows and mobile menu. No handcrafted replacement illustration or logo.

## Comparison history and fixes

- P1: incumbent route had narrow centered content, small thumbnail tabs and sans display text. Replaced those surfaces to follow the selected image.
- P2: initial rendered type had a smaller/lighter chapter heading and an excerpt occupying two rather than three lines. Adjusted variable type settings, display size/line height and reading size. Evidence: `implementation-iteration-1.png` → final desktop comparison.
- P2: fixed-height phone chronology produced an inner vertical scrollbar. Made its mobile height content-driven and disabled vertical overflow. Final phone capture retains horizontal chronology without the vertical scrollbar.
- P2: 768px English view was too dense in two columns. Moved the single-column breakpoint to 900px. Evidence: final `implementation-tablet-en.png`.
- P2: 320px viewport inherited the site's body min-width and overflowed by the native scrollbar width. Scoped body min-width to zero for the timeline. Verified clientWidth = scrollWidth = 305 at a 320px viewport.
- P2: an intermediate HMR render referenced the old Expand icon after import replacement. Replaced the remaining use with Search. Final TypeScript/build passes; fresh production browser log is empty.
- P2: final phone review found low-contrast inherited footer region text. Added timeline-only footer color and readable auxiliary type.
- Mechanical detector ran once. Its sole warning was an inherited Inter declaration; remaining route declarations were changed to Geologica.

## Functional verification

- All six chapter tabs select their own title and selected state.
- Keyboard ArrowRight wraps from Constitution to the first chapter; tab focus follows the active chapter.
- Production next selection and browser Back restore the correct chapter.
- Map opens the real source image in a native focus-trapped dialog; close returns to the page.
- The sources action expands the full article, scrolls to the sources, and focuses that section.
- The inline guide opens the existing guide dialog; close works. No new paid AI request was required for this UI check.
- RU/KK/EN switching and large text work. Mobile menu labels are visible; native summary and Escape handling are present.
- Narration entered its preparing state and reported the environment's missing system voice. The visible fallback and full narration text remain available. Audible speech is not verified in this browser.
- No horizontal document overflow at 320, 390, 768 or 2560px in the checked states.
- Fresh built-page browser errors/warnings: none.
- `npm run build`: passed (TypeScript and production Vite build).
- `node node_modules/vitest/vitest.mjs run --exclude 'output/**'`: 9 suites, 44 tests passed.
- A later plain `npm test` also discovered another task's archived test copies under `output/guide-history-2026-10-21/before/`; their missing relative dependencies fail test discovery. Those unrelated backup files and shared test configuration were not changed. The 44 actual source tests pass with the archive folder excluded.
- Focused diff whitespace checks for the timeline component and CSS reported no whitespace errors.

## Remaining P3 / expected differences

The generated concept is not an original Figma file with exact font metadata and separable artwork. Local font letterforms/antialiasing, decorative landscape details and the original-map pixels have small differences. This report does not claim numerical pixel identity. These do not change the accepted layout or block use. Native OS scrollbar appearance and responsive rearrangement are expected.

## Implementation checklist

- [x] Selected image resolved unambiguously.
- [x] Implemented controls and full content preserved.
- [x] Equal-size full and focused visual comparisons.
- [x] Responsive/language/large-text checks.
- [x] Production build, actual source tests and browser smoke.
- [x] No actionable P0/P1/P2 findings remaining for this route.

final result: passed


## 21 October 2026 — selected immersive story entrance

Current visual source: `.research/immersive-story-2026-10-21/reference.png`
(1536x1024), normalized to 1440x960 in `reference-1440.png`. Revised user copy:
Дом-музей Мухтара Ауэзова. The earlier dated-rail design is superseded.

Implementation: `desktop-final.png`, 1440x960 CSS viewport, density 1, RU,
Borili selected at #/home/borili, lower screen at the page end. Full comparison:
`comparison-final.png`; focused text/action comparison: `comparison-copy-final.png`.
All paths are within `.research/immersive-story-2026-10-21/`.
Mobile: `mobile-390.png`, CSS viewport 390x844; the IAB capture excludes its scrollbar.
Runtime observations and language checks: `browser-checks.json`.

First comparison: [P2] description too wide and small text too heavy; corrected
with a narrower column and light weights from the existing variable font. The
initial image placement was corrected to match the approved wide photo crop.
Post-fix evidence is the final full/focused pair. Checked typography, spacing,
forest/ivory/brass colors, native image quality, complete RU/KK/EN copy and actions.
The retained first-screen header/landscape slice intentionally differs from the
mock and was not redesigned. The image caption is an intentional provenance label.
No actionable P0/P1/P2 findings remain in the requested lower section.

Core behavior: story link opens #/place/borili; guide dialog context is Borili.
No horizontal overflow at desktop or mobile; main mobile targets are 53px and 48px.
Dates rail is absent. Final browser reload had zero console errors. The production
build passed; no physical-phone, external AI-answer or microphone tests were run.
The generated 1787x880 background is explicitly an illustration, not documentary
photography or 4K. Source photograph remains unchanged in the factual article.
Complete contract/provenance: `docs/immersive-story-design.md`.

final result: passed


---

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


## 21 October 2026 — permanently featured Borili

Later correction: the lower immersive story is permanently Borili and its approved
illustration, independent of the upper map selection. Removed the selected-place
prop and the alternate photograph path. Its story action targets Borili, and its
guide action explicitly supplies the Borili context. Layout and image assets are
unchanged from the approved design.

Verified on normal #/: the map initially selects Zhidebay while the lower scene is
Borili; switching the map to Semey retains Borili and the same image URL. The guide
opens with Borili selected. npm run check passed. Current browser evidence:
`.research/immersive-story-2026-10-21/borili-fixed.png`, 1440x960.

final result: passed
