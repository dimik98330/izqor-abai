# Journey page: one visual reference

Chosen comp: `.research/journey-design-2026-10-21/reference.png`.
The image was generated with the built-in ImageGen using the current page,
the existing artistic steppe background and the existing Semey museum photo.
This remains the main page composition reference. The user later selected the
second displayed place-selector mock, now saved as
`.research/place-index-2026-10-21/selected-reference.png`. That image overrides
the earlier open selected-story row only: warm-paper dock, vertical index on the
left, wide real photograph and selected-story details on the right.

## Pinned product commitments
- IZQOR gold wordmark, teal/white/brass identity.
- Headline on the left; one live geographic 3D model on the right.
- Existing camera bearing and geometry, five real places, RU/KK/EN.
- Existing guide, introduction, sources, accessibility and recording flows.
- No repeated five-card gallery on home.

## Measurable implementation contract
- Shared hero/header/editorial grid: maximum 1280px; desktop gutters 80px,
  intermediate 40px and phone 24px.
- Display: local Literata 400, 72–80px desktop / 46–54px phone, 1.1 line
  height, tracking -0.028em. Interface: local Geologica 400/500.
- Reading copy 17px desktop, 16px phone. Place choices 16px with 44px minimum
  targets, era and story action 14px. Rare source annotations may use 11–12px.
- Brass #d7ba80, warm white #f6f3e8, ink #113633, paper #f5f3ec.
- Plain header navigation with a brass active underline; no capsule shell.
- Primary button: one solid brass rectangle, 6px radius, minimum 54px
  height, ordinary arrow. Quiet secondary action; no nested circle.
- Explicit lighting correction: retain a directional golden sun at the left
  horizon, reduce the cold teal veil, use #fffdf3 for the headline and #fff9ed
  for the introduction. The sunlit primary action uses #e8c47e. On phones,
  reduce the light bloom and keep localized shading behind the reading text.
- Preserve that sunset with the saved higher-contrast option enabled. Shade
  only the reading area, rather than replacing the entire landscape overlay.
  On wide screens, position the warm bloom relative to the 1280px content shell.
- Omit the visible zoom/reset toolbar and drag hint, per the user's later request.
  Keep direct map gestures and keyboard navigation.
- Place selector: one #f5f0e3 paper surface, 7px corners, dark #113633 text;
  roughly 30/70 desktop columns. Selected index entry is ink green with warm-white
  lettering. Long names wrap fully. Keep that contrast with the saved contrast
  option enabled.
- Selected story: wide real photograph, Literata heading, era and one solid brass
  action. On narrower columns, move the action below the caption. On phones,
  move the index above the photograph in a two-column grid, with the final long
  name spanning both columns.
- Hero remains a landscape. Per the user's later request, omit the artistic-image
  note and credit-link row from the hero footer. Mobile map has a clear text list.
- Editorial continuation: actual Semey photograph left, existing explanation
  and timeline action right; an open paper surface, no giant rounded callout.
- Memories: simple two-column section separated by a rule; existing recording
  and privacy behavior.
- One restrained entrance; action feedback uses colour/opacity. Reduced motion
  has an immediate functional path.

## Screenshot comparison
Compare at the same 1440px browser width: first viewport and full page.
Check shared grid, hierarchy, title measure, button shape, map/selected-story
relationship and the open editorial section. Then check 360/390/768/1280/2560,
all three languages and larger text. Fix real differences, not merely build errors.

The generated comp is a visual brief, not factual source material. In particular,
its museum caption places the supplied Semey photograph in Zhidebay and its footer
invents a year and links. The implementation must use actual source captions and
existing real navigation. The live Three.js map replaces the illustrative map in
the comp; geographical accuracy takes precedence over generated raster details.

Source guidance reviewed:
- https://github.com/cyxzdev/Uncodixfy (useful restraint, applied within this cultural identity)
- https://github.com/pbakaus/impeccable (existing installed skill, craft floor and polish)
