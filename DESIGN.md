# IZQOR visual system

**Lower homepage, 21 October 2026:** the selected full-width photographic entrance
is specified in [docs/immersive-story-design.md](docs/immersive-story-design.md).
It replaces the navy continuation and dated rail only. The existing landscape
hero and geographic map retain their current contract.

**Timeline, 21 October 2026:** the selected image is `output/timeline-concepts-2026-10-21/concept-1.png`. The current contract is [docs/timeline-visual-contract.md](docs/timeline-visual-contract.md); rendered evidence is in [docs/timeline-design-qa.md](docs/timeline-design-qa.md). It supersedes older timeline-only typography and layout notes; other routes retain their own contracts.


**Journey page, 21 October 2026:** the current single-comp contract is
[`docs/journey-visual-contract.md`](docs/journey-visual-contract.md), with rendered
comparison evidence in [`docs/journey-design-review.md`](docs/journey-design-review.md).
It supersedes the earlier home control, radius and spacing notes: plain navigation,
brass rectangular actions, a live map on the right, open selected-story and editorial
rows, and a shared 1280px grid. Other surfaces retain their existing system.

**Home route, revised 20 October 2026:** the current landing contract is
[`docs/landing-design-system.md`](docs/landing-design-system.md). It supersedes
the earlier home layout and typography notes below. The home now uses a
landscape hero, local Literata/Geologica, a regional sculpture on the right and
a compact selected-story preview within the first screen. Other routes retain
the museum system below.

An editorial cultural journey through Abai Region, grounded in real photographs and geography. The supplied teal-and-gold reference sets the palette; Getty Persepolis informs scene scale and spatial transitions.

Palette: deep teal #103c3d, midnight #082b30, sand #eee6d5, parchment #f7f3e9, antique brass #c9a66b, dark ink #263e3b.

Typography: Noto Serif for expressive headings and literary passages; Golos Text for navigation and reading. Both support Cyrillic and Kazakh characters. Essential body text starts at 16px, 20px in comfortable mode. Prefer short lines and generous line height.

Composition: the entry screen pairs a readable editorial introduction with an interactive sculpture of the entire Abai region. Authentic photographs introduce individual stories below the atlas and inside each chapter. The full map keeps one selected place; story sections remain readable. Keep the guide and settings in accessible dialogs. Avoid permanent competing panels. Both map views have complete list alternatives.

Home layout contract: the outer shell owns the horizontal gutters and maximum width (1480px); the text column uses minmax(0, ...) without viewport-dependent internal padding. Never apply an expanding viewport offset inside a capped text container. Title measure is 11ch on desktop, 12–15ch on mobile. Break to one column at 760px; text can grow vertically. Check 390, 1440 and 2560px with RU/KK/EN and large text.

Home semantic tokens are extracted in `src/home-journey.css`: journey-night, journey-ivory, journey-brass, journey-secondary and journey-border reuse the established museum palette. Shared buttons keep the existing button / button-gold components. The regional sculpture uses the local OSM boundary and existing story coordinates; its extruded thickness is decorative, not a measured elevation model. Render on demand, pause outside the viewport, dispose GPU resources on unmount, retain an SVG and story-list alternative if WebGL fails. Controls work through pointer drag, touch, labeled buttons and keyboard. Camera reset fits the geographic outline; projected place labels avoid collisions.

Canva direction reference: https://canva.link/6r0qibzddxpf1yz . The live implementation, its screenshots and verification are in `.research/home-redesign/`; the editable reference is not evidence of runtime behavior.

Motion: meaningful transitions, a single entrance sequence, 180ms control feedback, 350ms panels, bounded camera flights. Honor reduced motion. Never require dragging, animation completion or sound to reach content.

Sources: factual paragraphs carry source links. Retain photo author, date and license. Reconstructions, folklore and personal memories are labeled. Source media is never silently replaced by generated evidence.

The six user-supplied component libraries were inspected as references. The interface uses one coherent set of native accessible controls, Lucide icons and custom product tokens instead of combining conflicting visual kits.

Oil Motion installed from oil-oil/oil-motion at commit 07e31f2265f80caa8f2c1df825d85ac24a46307c. Its own boundary routes pure UI transitions and live 3D to ordinary frontend code; no external video-generation workflow is required for this implementation.
