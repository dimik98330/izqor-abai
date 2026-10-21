# IZQOR landing — October 2026

Updated 21 October: use [journey-visual-contract.md](journey-visual-contract.md)
for the current comp-led refinement. The earlier description below is retained
as implementation history, not as authority for current capsules or glass panels.

Scope: home route and its regional overview. Existing story pages, API, guide conversation and timeline remain their own surfaces.

## Direction

Two directions were considered: an atlas-first museum dashboard, and a landscape-led cultural journey. The second was chosen because the supplied Halden brief asks for atmosphere and calm navigation, while IZQOR needs a clear invitation to explore real places.

The first screen pairs the landscape and editorial introduction on the left with the live geographic sculpture on the right. The map has a transparent background so it belongs to the landscape. Place selection and a compact story preview sit directly below the sculpture within the hero. There is one map instance, with no repeated atlas section below. On screens up to 1000px, the introduction and map stack vertically. The five-card catalogue remains on the separate Places & stories route.

The decorative hero uses the project's existing generated steppe image, visibly identified as an artistic impression. It is not presented as photographic evidence of Abai Region. Story photographs retain their existing provenance.

## Tokens

| Role | Value |
| --- | --- |
| Primary ink | `#183e36` |
| Paper | `#f5f5ef` |
| Atlas stage | `#173e3b` |
| Secondary copy | `#68756b` |
| Light action | `#f9f7ee` |
| Selected map label | `#fff8df` |
| Display | Literata variable, 400–500 |
| Interface and reading | Geologica variable, 400–600 |
| Container | hero maximum 1480px; 56px desktop / 36px tablet / 20px mobile gutters |
| Section spacing | 100 / 80 / 52px depending on hierarchy and viewport |
| Radius | 24px atlas, 18px stories, 7px map labels, pill actions |

Fonts are locally served WOFF2 under `public/fonts/landing`, with their OFL licenses. Glyph coverage was checked from the actual font cmap for all of `Ә Ғ Қ Ң Ө Ұ Ү Һ І` and lowercase equivalents. Manrope was evaluated but rejected because it lacks several required Kazakh glyphs.

Hero headlines use 48–94px depending on screen, a 1.1 line height and approximately 12 characters per line. Text uses 15–17px, with compact labels beside the map. There is no forced uppercase.

## Controls and motion

- Primary action: solid light pill, dark text, a distinct directional circle.
- Secondary action: quiet text and a play control for the existing introduction.
- Place selection: plain text tabs with an underline; no decorative location icons or checkmarks.
- Atlas markers: real geographic positions, small dots and place names. The active label changes colour.
- Zoom: a single two-button light control; fit-to-region is separate and explicitly labelled.
- Guide: compact, accessible circular launcher on the home page.
- Focus remains visible. Links open stories; buttons select places or change state.
- One 900ms entrance sequence, a gentle initial landscape zoom, 280ms selection crossfade and interruptible camera transitions.
- No scroll hijacking. Selecting a place changes neither the camera position nor document scroll.
- The main action focuses the integrated map, scrolling only when needed. The lower scroll cue continues to the next section.
- Reduced-motion removes decorative transitions and makes camera changes immediate.

## Geographic rendering

`region-framing.ts` fits the actual boundary in screen space. The invisible rectangular elevation mesh does not determine framing. Iterative perspective centring fills approximately 89% of the available limiting dimension while retaining the outline.

The map's vertical scaling and extruded base are presentation choices; underlying source coordinates and elevation samples are unchanged. A flat geographic outline and complete place list remain available without WebGL.

The user explicitly requested removing the "Open atlas" action and technical relief caption from this stage. Source attribution remains below the map.

The starting camera bearing now follows the user's later screenshot: Semey at
the near right edge, mountainous relief toward the back left. The shared
`REGION_OVERVIEW_DIRECTION` controls both initial loading and "Whole region".
Screen-space fitting still adapts the view to the available viewport.
