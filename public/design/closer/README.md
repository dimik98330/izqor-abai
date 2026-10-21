# IZQOR: closer to history

An isolated, interactive design study of the two home-page sections in the supplied screenshot and their footer. Open `/design/closer/index.html` on the running local Vite server (the explicit file name is needed because this server rewrites directory requests to the app). The production React application is unchanged.

## Direction

Keep IZQOR's forest, parchment and brass identity. Enlarge the real Semey photograph, bring the heading to the existing display scale and give personal memories a distinct forest-colored section with a compact recording surface. The photo sits on the right, balancing the left-aligned headline. The footer continues the same hierarchy.

- Paper `#f7f3e9`; ink `#163e36`; forest `#123e36`; deep forest `#0e302b`; brass `#e0bd79`.
- Existing locally hosted Literata (headings) and Geologica (interface). Cyrillic and extended Cyrillic subsets are included for Russian and Kazakh; Latin for English. Existing OFL license files remain in `/fonts/landing/`.
- Lucide geometry only, 1.65px stroke. Actions use 4px radii; the recording surface 12px; the photo remains rectangular.
- Maximum content width 1600px. Desktop split composition; single-column layout below 650px. Controls and text reflow in Russian, Kazakh and English.
- Hover response: arrow displacement, subtle photograph magnification, button color response. Recording animation starts only after explicit interaction. Reduced-motion preference disables animation.

## References

Primary composition reference: [Rijksmuseum Stories](https://www.rijksmuseum.nl/en/stories), specifically the emphasis on large authentic imagery, confident type and clear reading order. This study adapts those principles to IZQOR's existing visual identity; it does not reproduce Rijksmuseum's typography or layout.

- [shadcn Button](https://ui.shadcn.com/docs/components/base/button): action hierarchy, focus, native link semantics and button states. No dependency added or component source copied.
- [Uiverse arrow button by gharsh11032000](https://uiverse.io/gharsh11032000/loud-chicken-53): reference for directional hover feedback. Original CSS implementation here; no copied component code.
- [21st button gallery](https://21st.dev/community/components/s/button): inspected as a secondary component reference. No third-party registry installation.
- Magic UI, Aceternity UI and Hover.dev were surveyed for motion. No effects dependency is needed for this scoped prototype.
- Godly redirected to recent.design and could not be read using web fetch. Land-book, Lapa Ninja, Mobbin, Lucide, Phosphor, Google Fonts and Typewolf were surveyed. No claim that every gallery demo or mobile variant was tested.

The supplied Semey photo is preserved, with its existing credit and CC BY-SA 4.0 source link. No generated historical evidence is used.

## Prototype behavior

Navigation links lead to the existing app. Language controls switch all visible text, labels and placeholders. The photograph opens in a native modal dialog. The mobile menu expands. The recording control opens a clearly labeled animation demo: it does not request microphone access, record audio, upload data or create a recording. A production integration should reuse the current app's real recorder.

## Icon license

Lucide icons, ISC License.

Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
