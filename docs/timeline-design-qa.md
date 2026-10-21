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

